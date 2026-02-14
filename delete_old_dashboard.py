# Delete old renderDashboard function (lines 4993-5200)
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Delete lines 4993-5200 (0-indexed: 4992-5199)
new_lines = lines[:4992] + lines[5200:]

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Deleted old renderDashboard function")
print(f"Original lines: {len(lines)}")
print(f"New lines: {len(new_lines)}")
print(f"Deleted: {len(lines) - len(new_lines)} lines")
