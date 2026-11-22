# Security Summary

**Reviewed Files**: 12
**Issues Resolved**: 11

### Issues Resolved
| Area | File | Line | What Was Happening | Impact | Status | How It Was Fixed |
|---|---|---|---|---|---|---|
| Open CMS & Catalog Writes | `firestore.rules` | 158–289 | Ten public collections (`homepage`, `products`, `categories`, `about`, `contact`, `services_page`, `services`, `settings`, `page_contents`, `blog_posts`) allowed unauthenticated `write: if true`. | Critical | Fixed | Restricted writes to verified staff roles (`isStaffEditor()` / `isAdmin()`) with `isValidId()` path checks and deployed rules via `DeployRules`. |
| Unbounded Public Lead & Order Writes | `firestore.rules` | 183–242 | Public `create` rules on `orders`, `rma_requests`, `wizard_leads`, `event_quotes`, `inquiries`, `reseller_applications`, and `newsletter_subscribers` accepted arbitrary fields, sizes, and forged statuses. | High | Fixed | Added field-allowlist, string length, numeric range, initial status (`pending`/`new`), and `request.time` timestamp validation blueprints. |
| Unauthenticated `n8n_logs` Writes & Unverified Admin Check | `firestore.rules` | 20–27, 267–270 | Any client could insert fake entries into `n8n_logs`, and hardcoded superadmin email checks did not require `email_verified`. | Medium | Fixed | Blocked all client `create`/`update` on `n8n_logs` (written server-side only) and required `isEmailVerified()` alongside superadmin email verification. |
| Unprotected Mutation & Order Endpoints | `server.ts` | 831–1160 | `POST /api/settings`, `GET /api/orders`, `PATCH /api/orders/:id`, `POST /api/products`, `DELETE /api/products/:id`, and `POST /api/generate-image` lacked admin authentication checks. | Critical | Fixed | Enforced `verifyAdmin` middleware, field whitelisting, status enums, and prompt length bounds (`1–2000` chars), and wrapped `verifyAdmin` Firestore role lookups in `try/catch` to avoid superadmin lockouts. |
| Outbound Webhook SSRF Exposure | `server.ts` | 698–795, 859–990 | Stored n8n webhook URLs were fetched without checking for loopback, private LAN, or cloud metadata IP addresses, and followed HTTP redirects. | High | Fixed | Added `isSafeExternalWebhookUrl()` rejecting private/loopback/link-local hosts, set `redirect: 'error'`, and added a 10-second `AbortSignal.timeout`. |
| Unsanitized HTML Rendering (About) | `src/pages/About.tsx` | 91, 132, 143, 153, 189 | Five CMS HTML fields rendered directly into the DOM without script or attribute filtering. | High | Fixed | Routed all five fields through the shared `cleanRichTextHtml()` sanitizer (`src/lib/html-sanitize.ts`). |
| Unsanitized HTML Rendering (Contact) | `src/pages/Contact.tsx` | 113, 142 | Hero subheading and address CMS HTML rendered directly into the DOM without filtering. | High | Fixed | Wrapped both fields in `cleanRichTextHtml()`. |
| Unsanitized HTML Rendering (Home & Shop) | `src/pages/Home.tsx`, `src/pages/Shop.tsx` | 704, 986 (`Home.tsx`); 1223, 1333 (`Shop.tsx`) | Hero slide subtitles and product `shortDescription` HTML rendered directly without script/attribute stripping. | High | Fixed | Wrapped all four rendering locations in `cleanRichTextHtml()`. |
| Unsanitized HTML Rendering (Services & Product Details) | `src/pages/services/ServicesLanding.tsx`, `src/pages/services/ServiceDetail.tsx`, `src/pages/ProductDetails.tsx` | 128, 138, 165; 22, 62; 55 | Services rich text and product descriptions could pass inline `<script>`, `on*` attributes, or `javascript:` links. | High | Fixed | Standardized all pages on `cleanRichTextHtml()` while preserving whitelisted `youtube.com`/`youtube-nocookie.com` embeds. |
| JSON-LD Script Tag Breakout | `src/components/StructuredData.tsx` | 7 | Raw `<` characters inside serialized JSON-LD could break out of the `<script type="application/ld+json">` block. | Low | Fixed | Escaped `<` characters to `\u003c` during serialization. |
| Soft 404 Responses for Unknown Routes | `server.ts`, `src/App.tsx` | 3509–3575 (`server.ts`); 1515 (`src/App.tsx`) | Unrecognized URLs returned HTTP `200` with synthesized indexable titles and catch-all `/:keywordSlug` routing. | Medium | Fixed | Returned real HTTP `404` status, `X-Robots-Tag: noindex, nofollow`, `<meta name="robots" content="noindex, nofollow" />`, removed canonical/og:url links, and removed redundant `/:keywordSlug` catch-all. |

### Safeguards Verified
| Area | File | How It's Protected |
|---|---|---|
| API Keys & Secrets | `server.ts`, `.env.example` | Server-side AI image generation and Google Sheets credentials remain strictly on the server via `process.env` and OAuth Bearer tokens. |
| Path Confinement & Magic Bytes | `server.ts` | Admin media upload/delete endpoints validate image file magic bytes (`WebP`/`JPEG`/`PNG`), sanitize filenames, and enforce `path.resolve(...).startsWith(...)` directory confinement. |
| Firebase Auth & Session Enforcement | `server.ts`, `src/contexts/AuthContext.tsx` | Admin/editor backend routes verify Firebase ID tokens with `auth.verifyIdToken()` and inspect roles / verified superadmin email. |

---

## PoC Verification

### 1. Unauthenticated Admin API Access & Settings Overwrite
#### Summary
| Field | Value |
|---|---|
| Issue Type | Missing Authentication Check on Admin Endpoints |
| Impact | Critical |
| Affected File | `server.ts:784`, `server.ts:987`, `server.ts:1021`, `server.ts:1081` |
| Test Scenario | `GET /api/orders`, `POST /api/settings` (`{"taxRate": 0}`), `POST /api/products`, and `POST /api/generate-image` sent without an `Authorization: Bearer <idToken>` header. |

#### How It Was Fixed
Added `verifyAdmin` middleware to every sensitive configuration, order, product mutation, and AI generation endpoint, plus explicit field whitelisting and bounds validation.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Request arrives at `POST /api/settings` or `GET /api/orders` without a Bearer token | Request enters Express route chain |
| 2 | `verifyAdmin` executes at `server.ts:215–220` | Rejects missing/malformed `Authorization` header |
| 3 | Response returned immediately before handler runs | **Blocked with HTTP `401 Unauthorized`** |

#### Conclusion
**Fix Verified** - Unauthenticated callers can no longer read customer order records, overwrite site tax/contact settings, mutate server product memory, or invoke AI image generation.

---

### 2. Unsanitized Rich-Text HTML Payload (`<img src=x onerror=alert(1)>`)
#### Summary
| Field | Value |
|---|---|
| Issue Type | Unsanitized HTML Injection into DOM Sinks |
| Impact | High |
| Affected File | `src/lib/html-sanitize.ts:36–108` (`About.tsx`, `Contact.tsx`, `Home.tsx`, `Shop.tsx`, `ServicesLanding.tsx`, `ServiceDetail.tsx`, `ProductDetails.tsx`) |
| Test Scenario | A CMS field contains `<p>Specs</p><img src=x onerror=alert(1)><script>fetch('//evil')</script><a href="javascript:alert(1)">Click</a><iframe src="https://evil.example"></iframe>` |

#### How It Was Fixed
Created a centralized rich-text sanitizer `cleanRichTextHtml()` and applied it to every CMS/product HTML `dangerouslySetInnerHTML` sink.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Payload passes into `cleanRichTextHtml(rawHtml)` (`src/lib/html-sanitize.ts:36`) | Normalized before sanitization |
| 2 | Script/container block regex (`src/lib/html-sanitize.ts:50–53`) removes `<script>...</script>` | `<script>` element and body removed |
| 3 | Iframe allowlist (`src/lib/html-sanitize.ts:61–73`) checks `src` against `youtube.com`/`youtube-nocookie.com` | Untrusted `<iframe>` removed |
| 4 | Attribute scrubber (`src/lib/html-sanitize.ts:76–95`) strips `onerror=...` and rewrites `href="javascript:..."` via `isSafeUrlValue()` to `href="#"` | Event handler and dangerous URI neutralized |

#### Conclusion
**Fix Verified** - Only safe formatting markup and verified YouTube embeds reach the DOM; executable scripts, event handlers, and dangerous URI schemes are stripped across all pages.

---

### 3. Outbound Webhook SSRF Target (`http://169.254.169.254/latest/meta-data/`)
#### Summary
| Field | Value |
|---|---|
| Issue Type | Server-Side Request Forgery on Webhook Delivery |
| Impact | High |
| Affected File | `server.ts:698–743`, `server.ts:765`, `server.ts:815`, `server.ts:835`, `server.ts:889` |
| Test Scenario | An n8n workflow document or test call specifies `http://169.254.169.254/latest/meta-data/` or `http://127.0.0.1:8080/internal`. |

#### How It Was Fixed
Implemented `isSafeExternalWebhookUrl()` to reject private, loopback, link-local, and local hostnames across workflow creation, updates, manual tests, and automatic event triggers, while disabling automatic HTTP redirects (`redirect: 'error'`).

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | Webhook URL reaches `triggerN8NWorkflows` (`server.ts:765`) or `/api/admin/workflows` (`server.ts:815`) | URL passed to `isSafeExternalWebhookUrl` |
| 2 | `isSafeExternalWebhookUrl` (`server.ts:723–735`) inspects parsed IPv4 octets (`a === 169 && b === 254` / `a === 127`) | Returns `false` before `fetch()` is ever invoked |
| 3 | Execution aborts and logs a `400 Blocked unsafe or private webhook URL` audit record | **Internal metadata fetch prevented** |

#### Conclusion
**Fix Verified** - Outbound webhook triggers cannot reach internal loopback, RFC1918 LAN, or cloud metadata addresses or follow redirects into internal networks.

---

### 4. Unknown Route Soft-404 Prevention
#### Summary
| Field | Value |
|---|---|
| Issue Type | Soft-404 Response on Non-Existent Routes |
| Impact | Medium |
| Affected File | `server.ts:3509–3575`, `server.ts:3900–3955`, `src/App.tsx:1515` |
| Test Scenario | Request to `GET /this-route-does-not-exist-audit` |

#### How It Was Fixed
Removed the fallback metadata synthesis in `injectRouteSeoIntoHtml()`, returned `statusCode: 404` with `noindex, nofollow` (both `<meta>` and `X-Robots-Tag`), removed `<link rel="canonical">` and `og:url`, and removed the redundant `/:keywordSlug` catch-all route in `App.tsx`.

#### Step-by-Step Trace
| Step | What Happens in the Code | Outcome |
|---|---|---|
| 1 | `GET /this-route-does-not-exist-audit` clears Stage 1 redirects and hits HTML middleware (`server.ts:3902`) | Calls `injectRouteSeoIntoHtml` |
| 2 | `matched` is undefined (`server.ts:3511`) | Sets `isNotFoundRoute = true`, `statusCode = 404`, `noindex: true` |
| 3 | Response builder (`server.ts:3537–3541`) strips `<link rel="canonical">` and sends HTTP `404` | **Returns true HTTP 404 + `noindex, nofollow`** |

#### Conclusion
**Fix Verified** - Crawlers and browsers requesting non-existent URLs receive an authentic HTTP 404 response with `noindex, nofollow` and no canonical link.
