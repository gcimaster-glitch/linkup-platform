
import os
import re

# Paths
v3_path = '/home/user/webapp/frontend/dist_static_fallback/index_v3.html'
render_home_path = '/home/user/webapp/frontend/dist_static_fallback/assets/renderHome.js'
output_path = '/home/user/webapp/frontend/dist_static_fallback/index.html'

# Read v3
with open(v3_path, 'r', encoding='utf-8') as f:
    v3_content = f.read()

# Read fixed renderHome
with open(render_home_path, 'r', encoding='utf-8') as f:
    fixed_render_home = f.read()

# Extract the function body from fixed_render_home
# It starts with "function renderHome(container) {"
# We want to replace the existing renderHome in v3.

# Find start of renderHome in v3
start_marker = "function renderHome(container) {"
start_idx = v3_content.find(start_marker)

if start_idx == -1:
    print("Error: renderHome not found in v3")
    exit(1)

# Find the end of renderHome in v3.
# It's tricky with nested braces. 
# We assume the next function definition marks the end, OR we count braces.
# Let's count braces.
cnt = 0
end_idx = -1
for i in range(start_idx, len(v3_content)):
    if v3_content[i] == '{':
        cnt += 1
    elif v3_content[i] == '}':
        cnt -= 1
        if cnt == 0:
            end_idx = i + 1
            break

if end_idx == -1:
    print("Error: Could not find end of renderHome in v3")
    exit(1)

# Replace
new_content = v3_content[:start_idx] + fixed_render_home + v3_content[end_idx:]

# Also, v3 might have inline scripts. We want to keep them.
# v3 is a backup of the "huge file".
# So this result should be the full working site.

# Write to index.html
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"Successfully created index.html with fixed renderHome. Size: {len(new_content)}")
