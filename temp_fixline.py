from pathlib import Path
path = Path('src/components/employee-schedule/EmployeeDirectoryPanel.jsx')
text = path.read_bytes().decode('utf-8', errors='replace')
lines = text.splitlines(keepends=True)
if len(lines) > 419:
    lines[419] = '                <Label htmlFor="employee-hourly">Hourly rate (PHP)</Label>\n'
new_text = ''.join(lines)
path.write_text(new_text, encoding='utf-8')
