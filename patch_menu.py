import re
with open("src/App.tsx", "r") as f:
    content = f.read()
    
# Replace the fixed string with a template literal.
content = content.replace(
    '<div className="fixed top-[96px] data-[scrolled=true]:top-[64px] bottom-16 left-0 right-0 bg-white px-4 pt-2 pb-24 space-y-4 shadow-2xl z-40 overflow-y-auto lg:hidden">',
    '<div className={`fixed bottom-16 left-0 right-0 bg-white px-4 pt-2 pb-24 space-y-4 shadow-2xl z-40 overflow-y-auto lg:hidden transition-all duration-300 ${isScrolled ? "top-[64px]" : "top-[96px]"}`}>'
)

with open("src/App.tsx", "w") as f:
    f.write(content)
print("Done")
