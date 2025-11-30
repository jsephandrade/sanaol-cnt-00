from pathlib import Path
path = Path('src/components/employee-schedule/EmployeeDirectoryPanel.jsx')
lines = path.read_bytes().decode('utf-8', errors='replace').splitlines()
lines = [line for line in lines if line.strip() != '']
path.write_text('\n'.join(lines) + '\n', encoding='utf-8')
