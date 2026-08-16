import sys

with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{/* PRODUCTS */}' in line:
        start_idx = i
    if '{/* SERVICES */}' in line:
        end_idx = i - 1
        break

if start_idx != -1 and end_idx != -1:
    with open('patch_menu.txt', 'r') as pf:
        patch = pf.readlines()
    
    # insert a newline before SERVICES
    patch.append('\n')
    
    lines[start_idx:end_idx+1] = patch
    with open('src/App.tsx', 'w') as f:
        f.writelines(lines)
    print("Done")
else:
    print(f"Could not find indices: start={start_idx}, end={end_idx}")
