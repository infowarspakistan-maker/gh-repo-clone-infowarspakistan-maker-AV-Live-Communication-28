import os
import glob
import re

files_without_seo = [
    "src/pages/BlindDropShipping.tsx",
    "src/pages/BuyersGuides.tsx",
    "src/pages/Cart.tsx",
    "src/pages/Checkout.tsx",
    "src/pages/Compare.tsx",
    "src/pages/Esports.tsx",
    "src/pages/FAQs.tsx",
    "src/pages/FulfillmentServices.tsx",
    "src/pages/GovEdPricing.tsx",
    "src/pages/Payment.tsx",
    "src/pages/PrivacyPolicy.tsx",
    "src/pages/Promotions.tsx",
    "src/pages/Provisioning.tsx",
    "src/pages/Quote.tsx",
    "src/pages/RMA.tsx",
    "src/pages/Reseller.tsx",
    "src/pages/Returns.tsx",
    "src/pages/Reviews.tsx",
    "src/pages/RoomDesigner.tsx",
    "src/pages/Shipping.tsx",
    "src/pages/Solutions.tsx",
    "src/pages/TermsOfService.tsx",
    "src/pages/VoipService.tsx"
]

for filepath in files_without_seo:
    with open(filepath, 'r') as f:
        content = f.read()

    # Determine page name from filename
    page_name = os.path.basename(filepath).replace(".tsx", "")
    page_title = re.sub(r"([A-Z])", r" \1", page_name).strip()

    if "import { SEO" not in content:
        # Find the last import
        import_match = list(re.finditer(r'^import .*;', content, re.MULTILINE))
        if import_match:
            last_import = import_match[-1]
            insert_pos = last_import.end()
            content = content[:insert_pos] + "\nimport { SEO } from '../components/SEO';" + content[insert_pos:]
        else:
            content = "import { SEO } from '../components/SEO';\n" + content
    
    # Add <SEO title="..." /> as the first child of the return statement
    if "<SEO" not in content:
        return_match = re.search(r'return\s*\(\s*(<[^>]+>)', content)
        if return_match:
            insert_pos = return_match.end()
            
            # Special case for Cart and Checkout, use noindex
            if page_name in ["Cart", "Checkout"]:
                seo_tag = f"\n      <SEO title=\"{page_title}\" noindex />"
            else:
                seo_tag = f"\n      <SEO title=\"{page_title}\" />"
                
            content = content[:insert_pos] + seo_tag + content[insert_pos:]
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Added SEO to {filepath}")
        else:
            # Maybe it returns a fragment <> 
            return_frag_match = re.search(r'return\s*\(\s*<>', content)
            if return_frag_match:
                insert_pos = return_frag_match.end()
                if page_name in ["Cart", "Checkout"]:
                    seo_tag = f"\n      <SEO title=\"{page_title}\" noindex />"
                else:
                    seo_tag = f"\n      <SEO title=\"{page_title}\" />"
                content = content[:insert_pos] + seo_tag + content[insert_pos:]
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Added SEO to {filepath}")
            else:
                print(f"Could not find return statement in {filepath}")

