import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  onSnapshot,
  setDoc,
  Unsubscribe,
  Timestamp,
  limit as firestoreLimit,
  arrayUnion,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage, auth } from './client';
import { v4 as uuidv4 } from 'uuid';

async function getAuthHeader() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================
// PRODUCT CRUD OPERATIONS
// ============================================

export interface Product {
  id?: string;
  slug?: string;
  productName: string;
  sku: string;
  shortDescription: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  categoryIds: string[];
  categorySlugs: string[];
  brand: string;
  variations: any[];
  isActive: boolean;
  isFeatured?: boolean;
  specifications?: string;
  seoTags?: string;
  seoMetaDescription?: string;
  imageAltText?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export function subscribeToProducts(
  callback: (products: Product[]) => void,
  filter?: { isActive?: boolean; categoryId?: string }
): Unsubscribe {
  let q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));

  if (filter?.isActive !== undefined) {
    q = query(q, where('isActive', '==', filter.isActive));
  }

  return onSnapshot(q, (snapshot) => {
    const products: Product[] = [];
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    callback(products);
  });
}

async function uploadBase64ImagesInHtml(html: string, productId: string): Promise<string> {
  if (!html) return html;

  // Find all matches of base64 image sources
  const regex = /src="(data:image\/([a-zA-Z0-9+-.]+);base64,([^"]+))"/g;
  let match;
  let updatedHtml = html;
  
  const matches: { fullMatch: string; mimeType: string; base64Data: string }[] = [];
  
  regex.lastIndex = 0;
  while ((match = regex.exec(html)) !== null) {
    matches.push({
      fullMatch: match[1],
      mimeType: match[2],
      base64Data: match[3],
    });
  }
  
  for (const item of matches) {
    try {
      // Decode base64
      const byteCharacters = atob(item.base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${item.mimeType}` });
      const file = new File([blob], `pasted_image_${Date.now()}.${item.mimeType}`, { type: `image/${item.mimeType}` });
      
      const url = await uploadProductImage(file, productId);
      updatedHtml = updatedHtml.replaceAll(item.fullMatch, url);
    } catch (err) {
      console.error('Failed to upload pasted base64 image in rich text:', err);
    }
  }
  
  return updatedHtml;
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Pre-generate a doc reference so we have the ID for the storage upload path
  const docRef = doc(collection(db, 'products'));
  const id = docRef.id;

  let processedDescription = data.description || '';
  let processedSpecifications = data.specifications || '';

  try {
    processedDescription = await uploadBase64ImagesInHtml(processedDescription, id);
    processedSpecifications = await uploadBase64ImagesInHtml(processedSpecifications, id);
  } catch (err) {
    console.error('Error pre-processing description base64 images:', err);
  }

  await setDoc(docRef, {
    ...data,
    description: processedDescription,
    specifications: processedSpecifications,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return id;
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<void> {
  const docRef = doc(db, 'products', id);

  let processedDescription = data.description;
  let processedSpecifications = data.specifications;

  try {
    if (processedDescription) {
      processedDescription = await uploadBase64ImagesInHtml(processedDescription, id);
    }
    if (processedSpecifications) {
      processedSpecifications = await uploadBase64ImagesInHtml(processedSpecifications, id);
    }
  } catch (err) {
    console.error('Error pre-processing description base64 images in update:', err);
  }

  const updateData: any = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (processedDescription !== undefined) {
    updateData.description = processedDescription;
  }
  if (processedSpecifications !== undefined) {
    updateData.specifications = processedSpecifications;
  }

  await updateDoc(docRef, updateData);
}

export async function deleteProduct(id: string): Promise<void> {
  const productDoc = await getDoc(doc(db, 'products', id));
  if (productDoc.exists()) {
    const product = productDoc.data() as Product;
    if (product.images) {
      for (const imageUrl of product.images) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }
  }
  await deleteDoc(doc(db, 'products', id));
}

// ============================================
// IMAGE UPLOAD HELPERS
// ============================================

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split('.').pop();
  const fileName = `${productId}/${uuidv4()}.${ext}`;
  const storageRef = ref(storage, `products/${fileName}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteProductImage(imageUrl: string): Promise<void> {
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// ============================================
// CATEGORY CRUD OPERATIONS
// ============================================

export interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl?: string;
  parentId: string | null;
  displayOrder: number;
  isActive: boolean;
  isFeatured?: boolean;
  seoTags?: string;
  seoMetaDescription?: string;
  imageAltText?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function getCategories(): Promise<Category[]> {
  const snapshot = await getDocs(
    query(collection(db, 'categories'), orderBy('displayOrder', 'asc'))
  );
  const categories: Category[] = [];
  snapshot.forEach((doc) => {
    categories.push({ id: doc.id, ...doc.data() } as Category);
  });
  return categories;
}

export function subscribeToCategories(
  callback: (categories: Category[]) => void
): Unsubscribe {
  const q = query(collection(db, 'categories'), orderBy('displayOrder', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories: Category[] = [];
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    callback(categories);
  });
}

export async function createCategory(
  data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'categories'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<void> {
  const docRef = doc(db, 'categories', id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  // Find all children of this category
  const childrenQuery = query(
    collection(db, 'categories'),
    where('parentId', '==', id)
  );
  const childrenSnapshot = await getDocs(childrenQuery);
  
  // Reassign children to no parent
  for (const childDoc of childrenSnapshot.docs) {
    await updateDoc(doc(db, 'categories', childDoc.id), {
      parentId: null,
      updatedAt: serverTimestamp(),
    });
  }

  await deleteDoc(doc(db, 'categories', id));
}

export async function reorderCategories(
  updates: { id: string; displayOrder: number; parentId?: string | null }[]
): Promise<void> {
  const promises = updates.map(update => {
    const docRef = doc(db, 'categories', update.id);
    const data: any = { displayOrder: update.displayOrder };
    if (update.parentId !== undefined) {
      data.parentId = update.parentId;
    }
    return updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  });
  await Promise.all(promises);
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildCategoryTree(
  categories: Category[]
): (Category & { children: any[] })[] {
  const map: Record<string, any> = {};
  const roots: any[] = [];

  categories.forEach((cat) => {
    map[cat.id!] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (cat.parentId === cat.id) {
      roots.push(map[cat.id!]);
      return;
    }
    if (cat.parentId && map[cat.parentId]) {
      map[cat.parentId].children.push(map[cat.id!]);
    } else {
      roots.push(map[cat.id!]);
    }
  });

  const visited = new Set<string>();
  const sortByOrder = (items: any[]) => {
    items.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    items.forEach((item) => {
      if (item.id && !visited.has(item.id)) {
        visited.add(item.id);
        if (item.children) {
          sortByOrder(item.children);
        }
      }
    });
  };
  sortByOrder(roots);

  return roots;
}

// ============================================
// ORDER FUNCTIONS
// ============================================

export interface Order {
  id?: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  billingAddress?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentMethod: 'stripe' | 'bank_transfer' | 'check' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  variation?: string;
}

export async function getOrders(
  filters?: {
    orderStatus?: Order['orderStatus'];
    paymentStatus?: Order['paymentStatus'];
    customerEmail?: string;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<Order[]> {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  if (filters?.orderStatus) {
    q = query(q, where('orderStatus', '==', filters.orderStatus));
  }
  if (filters?.paymentStatus) {
    q = query(q, where('paymentStatus', '==', filters.paymentStatus));
  }
  if (filters?.customerEmail) {
    q = query(q, where('customerEmail', '==', filters.customerEmail));
  }
  if (filters?.startDate) {
    q = query(q, where('createdAt', '>=', filters.startDate));
  }
  if (filters?.endDate) {
    q = query(q, where('createdAt', '<=', filters.endDate));
  }

  const snapshot = await getDocs(q);
  const orders: Order[] = [];
  snapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() } as Order);
  });
  return orders;
}

export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  filters?: { orderStatus?: Order['orderStatus'] }
): Unsubscribe {
  let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
  if (filters?.orderStatus) {
    q = query(q, where('orderStatus', '==', filters.orderStatus));
  }
  return onSnapshot(q, (snapshot) => {
    const orders: Order[] = [];
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
    });
    callback(orders);
  });
}

export async function getOrder(id: string): Promise<Order | null> {
  const docRef = doc(db, 'orders', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Order;
  }
  return null;
}

export async function updateOrderStatus(
  id: string,
  status: Order['orderStatus']
): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    orderStatus: status,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePaymentStatus(
  id: string,
  status: Order['paymentStatus']
): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    paymentStatus: status,
    updatedAt: serverTimestamp(),
  });
}

export async function addTrackingNumber(
  id: string,
  trackingNumber: string
): Promise<void> {
  const docRef = doc(db, 'orders', id);
  await updateDoc(docRef, {
    trackingNumber,
    updatedAt: serverTimestamp(),
  });
}

export async function getOrderStats(): Promise<{
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  revenueThisMonth: number;
  ordersThisMonth: number;
}> {
  const snapshot = await getDocs(collection(db, 'orders'));
  const orders: Order[] = [];
  snapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() } as Order);
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  let totalRevenue = 0;
  let revenueThisMonth = 0;
  let pending = 0,
    processing = 0,
    shipped = 0,
    delivered = 0,
    cancelled = 0;

  orders.forEach((order) => {
    if (order.orderStatus === 'delivered' || order.paymentStatus === 'paid') {
      totalRevenue += order.total || 0;
    }
    if (order.createdAt?.toDate() && order.createdAt.toDate() >= startOfMonth) {
      if (order.orderStatus === 'delivered' || order.paymentStatus === 'paid') {
        revenueThisMonth += order.total || 0;
      }
    }

    switch (order.orderStatus) {
      case 'pending':
        pending++;
        break;
      case 'processing':
        processing++;
        break;
      case 'shipped':
        shipped++;
        break;
      case 'delivered':
        delivered++;
        break;
      case 'cancelled':
        cancelled++;
        break;
    }
  });

  return {
    totalOrders: orders.length,
    totalRevenue,
    pendingOrders: pending,
    processingOrders: processing,
    shippedOrders: shipped,
    deliveredOrders: delivered,
    cancelledOrders: cancelled,
    revenueThisMonth,
    ordersThisMonth: orders.filter(
      (o) => o.createdAt?.toDate() && o.createdAt.toDate() >= startOfMonth
    ).length,
  };
}

export async function createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'orders'), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// ============================================
// RMA FUNCTIONS
// ============================================

export interface RMARequest {
  id?: string;
  orderNumber: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  productId: string;
  productName: string;
  sku: string;
  reason: string;
  issueDescription: string;
  images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  adminNotes?: string[];
  returnTrackingNumber?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function getRMARequests(filters?: { status?: RMARequest['status'] }): Promise<RMARequest[]> {
  let q = query(collection(db, 'rma_requests'), orderBy('createdAt', 'desc'));
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  const snapshot = await getDocs(q);
  const requests: RMARequest[] = [];
  snapshot.forEach((doc) => {
    requests.push({ id: doc.id, ...doc.data() } as RMARequest);
  });
  return requests;
}

export function subscribeToRMARequests(
  callback: (requests: RMARequest[]) => void,
  filters?: { status?: RMARequest['status'] }
): Unsubscribe {
  let q = query(collection(db, 'rma_requests'), orderBy('createdAt', 'desc'));
  if (filters?.status) {
    q = query(q, where('status', '==', filters.status));
  }
  return onSnapshot(q, (snapshot) => {
    const requests: RMARequest[] = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as RMARequest);
    });
    callback(requests);
  });
}

export async function updateRMARequestStatus(
  id: string,
  status: RMARequest['status'],
  rejectionReason?: string
): Promise<void> {
  const docRef = doc(db, 'rma_requests', id);
  const updateData: any = {
    status,
    updatedAt: serverTimestamp(),
  };
  if (rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }
  await updateDoc(docRef, updateData);
}

export async function addRMANote(id: string, note: string): Promise<void> {
  const docRef = doc(db, 'rma_requests', id);
  await updateDoc(docRef, {
    adminNotes: arrayUnion(note),
    updatedAt: serverTimestamp(),
  });
}

export async function addRMATracking(id: string, trackingNumber: string): Promise<void> {
  const docRef = doc(db, 'rma_requests', id);
  await updateDoc(docRef, {
    returnTrackingNumber: trackingNumber,
    updatedAt: serverTimestamp(),
  });
}

export async function getRMAStats(): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
}> {
  const snapshot = await getDocs(collection(db, 'rma_requests'));
  const requests: RMARequest[] = [];
  snapshot.forEach((doc) => {
    requests.push({ id: doc.id, ...doc.data() } as RMARequest);
  });

  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    approved: requests.filter((r) => r.status === 'approved').length,
    rejected: requests.filter((r) => r.status === 'rejected').length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };
}


export interface StockHistoryEntry {
  id?: string;
  productId: string;
  productName: string;
  sku: string;
  previousStock: number;
  newStock: number;
  change: number; // positive = added, negative = removed
  reason: string; // 'manual_update', 'order_fulfilled', 'restock', 'adjustment'
  updatedBy: string; // admin email or uid
  createdAt?: Timestamp;
}

export async function getProduct(id: string): Promise<Product | null> {
  const docSnap = await getDoc(doc(db, 'products', id));
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Product;
  }
  return null;
}

export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, 'products'));
  const products: Product[] = [];
  snapshot.forEach((doc) => {
    products.push({ id: doc.id, ...doc.data() } as Product);
  });
  return products;
}

export async function addStockHistory(
  entry: Omit<StockHistoryEntry, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'stock_history'), {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getStockHistory(
  productId: string,
  limitCount: number = 20
): Promise<StockHistoryEntry[]> {
  const q = query(
    collection(db, 'stock_history'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc'),
    firestoreLimit(limitCount)
  );
  const snapshot = await getDocs(q);
  const history: StockHistoryEntry[] = [];
  snapshot.forEach((doc) => {
    history.push({ id: doc.id, ...doc.data() } as StockHistoryEntry);
  });
  return history;
}

export async function updateStockWithHistory(
  productId: string,
  newStock: number,
  reason: string = 'manual_update',
  updatedBy: string = 'admin'
): Promise<void> {
  const product = await getProduct(productId);
  if (!product) throw new Error('Product not found');

  const previousStock = product.stockQuantity || 0;

  await updateProduct(productId, {
    stockQuantity: newStock,
  });

  await addStockHistory({
    productId,
    productName: product.productName,
    sku: product.sku,
    previousStock,
    newStock,
    change: newStock - previousStock,
    reason,
    updatedBy,
  });
}

export async function bulkUpdateStock(
  updates: { id: string; stockQuantity: number }[]
): Promise<void> {
  const promises = updates.map(async (update) => {
    const product = await getProduct(update.id);
    if (!product) return;

    const previousStock = product.stockQuantity || 0;
    
    await updateProduct(update.id, {
      stockQuantity: update.stockQuantity,
    });

    await addStockHistory({
      productId: update.id,
      productName: product.productName,
      sku: product.sku,
      previousStock,
      newStock: update.stockQuantity,
      change: update.stockQuantity - previousStock,
      reason: 'bulk_update',
      updatedBy: 'admin',
    });
  });
  await Promise.all(promises);
}

// ============================================
// HOMEPAGE FUNCTIONS
// ============================================

export interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  imageUrl: string;
  mediaType: 'image' | 'video' | 'youtube';
  isActive: boolean;
  order: number;
  textAlignment: 'left' | 'center' | 'right';
  overlayOpacity: number; // 0-100
}

export interface Brand {
  id?: string;
  name: string;
  logoUrl: string;
  website: string;
  order: number;
}

export interface Testimonial {
  id?: string;
  name: string;
  designation: string;
  text: string;
  rating: number; // 1-5
  avatarUrl: string;
  order: number;
}

export interface HomepageData {
  heroSlides: HeroSlide[];
  brands: Brand[];
  testimonials: Testimonial[];
  stats: {
    yearsExperience: number;
    happyClients: number;
    projectsCompleted: number;
  };
  promoBanner: {
    headline: string;
    subheadline: string;
    ctaText: string;
    ctaLink: string;
    backgroundImageUrl: string;
    isActive: boolean;
  };
  seo?: {
    title: string;
    description: string;
    keywords: string;
  };
  updatedAt?: Timestamp;
}

// Get homepage data
function enrichHomepageData(data: HomepageData): HomepageData {
  if (data) {
    if (data.heroSlides) {
      data.heroSlides = data.heroSlides.map((slide, idx) => ({
        ...slide,
        id: slide.id || `slide-${idx}`,
      }));
    }
    if (data.brands) {
      data.brands = data.brands.map((brand, idx) => ({
        ...brand,
        id: brand.id || `brand-${idx}`,
      }));
    }
    if (data.testimonials) {
      data.testimonials = data.testimonials.map((t, idx) => ({
        ...t,
        id: t.id || `testimonial-${idx}`,
      }));
    }
  }
  return data;
}

export async function getHomepageData(): Promise<HomepageData | null> {
  const docRef = doc(db, 'homepage', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return enrichHomepageData(docSnap.data() as HomepageData);
  }
  return null;
}

// Subscribe to real-time homepage data
export function subscribeToHomepage(
  callback: (data: HomepageData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'homepage', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(enrichHomepageData(docSnap.data() as HomepageData));
    } else {
      callback(null);
    }
  });
}

// Update entire homepage
export async function updateHomepage(data: HomepageData): Promise<void> {
  const docRef = doc(db, 'homepage', 'main');
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// ============================================
// HERO SLIDE OPERATIONS
// ============================================

// Add a hero slide
export async function addHeroSlide(
  slide: Omit<HeroSlide, 'id'>
): Promise<void> {
  const homepage = await getHomepageData();
  const slides = homepage?.heroSlides || [];
  const newSlide = {
    ...slide,
    id: uuidv4(),
  };
  slides.push(newSlide);
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  } as HomepageData);
}

// Update a hero slide
export async function updateHeroSlide(
  slideId: string,
  updates: Partial<HeroSlide>
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const slides = homepage.heroSlides.map((slide) =>
    slide.id === slideId ? { ...slide, ...updates } : slide
  );
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  });
}

// Remove a hero slide
export async function removeHeroSlide(slideId: string): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const slides = homepage.heroSlides.filter((slide) => slide.id !== slideId);
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  });
}

// Reorder hero slides
export async function reorderHeroSlides(
  slideIds: string[]
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const slides = slideIds.map((id, index) => {
    const slide = homepage.heroSlides.find((s) => s.id === id);
    return { ...slide, order: index + 1 };
  }) as HeroSlide[];
  await updateHomepage({
    ...homepage,
    heroSlides: slides,
  });
}

// ============================================
// BRAND OPERATIONS
// ============================================

export async function addBrand(brand: Omit<Brand, 'id'>): Promise<void> {
  const homepage = await getHomepageData();
  const brands = homepage?.brands || [];
  const newBrand = { ...brand, id: uuidv4() };
  brands.push(newBrand);
  await updateHomepage({
    ...homepage,
    brands: brands,
  } as HomepageData);
}

export async function updateBrand(
  brandId: string,
  updates: Partial<Brand>
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const brands = homepage.brands.map((brand) =>
    brand.id === brandId ? { ...brand, ...updates } : brand
  );
  await updateHomepage({
    ...homepage,
    brands: brands,
  });
}

export async function removeBrand(brandId: string): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const brands = homepage.brands.filter((brand) => brand.id !== brandId);
  await updateHomepage({
    ...homepage,
    brands: brands,
  });
}

// ============================================
// TESTIMONIAL OPERATIONS
// ============================================

export async function addTestimonial(
  testimonial: Omit<Testimonial, 'id'>
): Promise<void> {
  const homepage = await getHomepageData();
  const testimonials = homepage?.testimonials || [];
  const newTestimonial = { ...testimonial, id: uuidv4() };
  testimonials.push(newTestimonial);
  await updateHomepage({
    ...homepage,
    testimonials: testimonials,
  } as HomepageData);
}

export async function updateTestimonial(
  testimonialId: string,
  updates: Partial<Testimonial>
): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const testimonials = homepage.testimonials.map((t) =>
    t.id === testimonialId ? { ...t, ...updates } : t
  );
  await updateHomepage({
    ...homepage,
    testimonials: testimonials,
  });
}

export async function removeTestimonial(testimonialId: string): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  const testimonials = homepage.testimonials.filter((t) => t.id !== testimonialId);
  await updateHomepage({
    ...homepage,
    testimonials: testimonials,
  });
}

// ============================================
// STATS OPERATIONS
// ============================================

export async function updateStats(stats: {
  yearsExperience: number;
  happyClients: number;
  projectsCompleted: number;
}): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  await updateHomepage({
    ...homepage,
    stats: stats,
  });
}

// ============================================
// PROMO BANNER OPERATIONS
// ============================================

export async function updatePromoBanner(promoBanner: HomepageData['promoBanner']): Promise<void> {
  const homepage = await getHomepageData();
  if (!homepage) return;
  await updateHomepage({
    ...homepage,
    promoBanner: promoBanner,
  });
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'admin' | 'editor' | 'support' | 'customer' | null;
  isActive: boolean;
  isBlocked?: boolean;
  phoneNumber?: string | null;
  photoURL?: string | null;
  createdAt?: Timestamp;
  lastLogin?: Timestamp;
}

export function subscribeToUsers(
  callback: (users: UserProfile[]) => void,
  filter?: { role?: UserProfile['role'] | 'staff' }
): Unsubscribe {
  let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

  if (filter?.role) {
    if (filter.role === 'staff') {
      q = query(q, where('role', 'in', ['admin', 'editor', 'support']));
    } else {
      q = query(q, where('role', '==', filter.role));
    }
  }

  return onSnapshot(q, (snapshot) => {
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push({ ...doc.data() } as UserProfile);
    });
    callback(users);
  });
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/users', {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, ...updates }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user profile');
  }
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/users', {
    method: 'DELETE',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user account');
  }
}

export async function createStaffUser(data: {
  email: string;
  password: string;
  displayName: string;
  role: UserProfile['role'];
}): Promise<UserProfile> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create staff user');
  }
  return response.json();
}

// ============================================
// CUSTOMER FUNCTIONS
// ============================================

export interface CustomerUser extends UserProfile {
  orders?: number;
  totalSpent?: number;
}

export async function getCustomers(): Promise<CustomerUser[]> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/customers', {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customers');
  }
  return response.json();
}

export async function toggleCustomerBlock(
  uid: string,
  isBlocked: boolean
): Promise<void> {
  const headers = await getAuthHeader();
  const response = await fetch('/api/admin/customers', {
    method: 'PUT',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uid, isBlocked }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update customer status');
  }
}

export async function getCustomerOrders(uid: string): Promise<any[]> {
  const headers = await getAuthHeader();
  const response = await fetch(`/api/admin/customers?uid=${uid}`, {
    method: 'GET',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch customer orders');
  }
  return response.json();
}

// ============================================
// SETTINGS FUNCTIONS
// ============================================

export interface GeneralSettings {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  contactEmail: string;
  phone: string;
  address: string;
  taxRate: number;
  socialLinks: {
    facebook: string;
    linkedin: string;
    youtube: string;
    instagram: string;
    twitter: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
  updatedAt?: Timestamp;
}

export async function getGeneralSettings(): Promise<GeneralSettings | null> {
  const docRef = doc(db, 'settings', 'global');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as GeneralSettings;
  }
  return null;
}

export function subscribeToGeneralSettings(
  callback: (data: GeneralSettings | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as GeneralSettings);
    } else {
      callback(null);
    }
  });
}

export async function updateGeneralSettings(
  data: Partial<GeneralSettings>
): Promise<void> {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export interface Service {
  id?: string;
  title: string;
  name?: string;
  slug: string;
  description: string;
  iconUrl: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  category?: string;
  type?: string;
  serviceType?: string;
  heroHeading?: string;
  detailedContent?: string;
  priceRange?: string;
  formFields?: any;
  seoTags?: string;
  seoMetaDescription?: string;
  imageAltText?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ============================================
// ABOUT PAGE FUNCTIONS
// ============================================

export interface AboutData {
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  mission: string;
  vision: string;
  history: string;
  teamDescription: string;
  teamImages: string[];
  values: string[];
  stats: {
    yearsExperience: number;
    happyClients: number;
    projectsCompleted: number;
    teamMembers: number;
  };
  updatedAt?: Timestamp;
}

export async function getAboutData(): Promise<AboutData | null> {
  const docRef = doc(db, 'about', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as AboutData;
  }
  return null;
}

export function subscribeToAbout(
  callback: (data: AboutData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'about', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as AboutData);
    } else {
      callback(null);
    }
  });
}

export async function updateAboutData(data: Partial<AboutData>): Promise<void> {
  const docRef = doc(db, 'about', 'main');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ============================================
// CONTACT PAGE FUNCTIONS
// ============================================

export interface ContactData {
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  address: string;
  phone: string;
  email: string;
  mapEmbedUrl: string;
  businessHours: {
    weekday: string;
    saturday: string;
    sunday: string;
  };
  socialLinks: {
    facebook: string;
    linkedin: string;
    youtube: string;
    instagram: string;
    twitter: string;
  };
  updatedAt?: Timestamp;
}

export async function getContactData(): Promise<ContactData | null> {
  const docRef = doc(db, 'contact', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as ContactData;
  }
  return null;
}

export function subscribeToContact(
  callback: (data: ContactData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'contact', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as ContactData);
    } else {
      callback(null);
    }
  });
}

export async function updateContactData(data: Partial<ContactData>): Promise<void> {
  const docRef = doc(db, 'contact', 'main');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// ============================================
// SERVICES PAGE FUNCTIONS
// ============================================

export interface ServicePageData {
  heroHeading: string;
  heroSubheading: string;
  heroImageUrl: string;
  introText: string;
  serviceIds: string[];
  ctaText: string;
  ctaLink: string;
  updatedAt?: Timestamp;
}

export async function getServicesPageData(): Promise<ServicePageData | null> {
  const docRef = doc(db, 'services_page', 'main');
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as ServicePageData;
  }
  return null;
}

export function subscribeToServicesPage(
  callback: (data: ServicePageData | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'services_page', 'main'), (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data() as ServicePageData);
    } else {
      callback(null);
    }
  });
}

export async function updateServicesPageData(
  data: Partial<ServicePageData>
): Promise<void> {
  const docRef = doc(db, 'services_page', 'main');
  await setDoc(
    docRef,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}


export async function createService(service: Omit<Service, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'services'), {
    ...service,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateService(id: string, updates: Partial<Service>): Promise<void> {
  const docRef = doc(db, 'services', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteService(id: string): Promise<void> {
  const docRef = doc(db, 'services', id);
  await deleteDoc(docRef);
}

export async function getAllServices(): Promise<Service[]> {
  const snapshot = await getDocs(
    query(collection(db, 'services'), orderBy('order', 'asc'))
  );
  const services: Service[] = [];
  snapshot.forEach((doc) => {
    services.push({ id: doc.id, ...doc.data() } as Service);
  });
  return services;
}

// ============================================
// PAGE CONTENT FUNCTIONS
// ============================================

export interface PageContent {
  id: string;
  title: string;
  subtitle?: string;
  sections: any[];
  updatedAt?: Timestamp;
}

export async function getPageContent(pageId: string): Promise<PageContent | null> {
  const docRef = doc(db, 'page_contents', pageId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as PageContent;
  }
  return null;
}

export function subscribeToPageContent(
  pageId: string,
  callback: (data: PageContent | null) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'page_contents', pageId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() } as PageContent);
    } else {
      callback(null);
    }
  });
}

export async function updatePageContent(pageId: string, data: Partial<PageContent>): Promise<void> {
  const docRef = doc(db, 'page_contents', pageId);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  image: string;
  category: string;
  author: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: string;
  updatedAt?: any;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const q = query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  const snapshot = await getDocs(q);
  const posts: BlogPost[] = [];
  snapshot.forEach((doc) => {
    posts.push({ id: doc.id, ...doc.data() } as BlogPost);
  });
  return posts;
}

export function subscribeToBlogPosts(callback: (posts: BlogPost[]) => void): Unsubscribe {
  const q = query(collection(db, 'blog_posts'), orderBy('publishedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const posts: BlogPost[] = [];
    snapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() } as BlogPost);
    });
    callback(posts);
  });
}
