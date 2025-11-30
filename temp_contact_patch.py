# -*- coding: utf-8 -*-
from pathlib import Path
import re
path = Path('src/components/employee-schedule/EmployeeDirectoryPanel.jsx')
text = path.read_text(encoding='utf-8')
contact_pattern = re.compile(r'<div className="space-y-2">\s*<Label htmlFor="employee-contact">Contact details</Label>\s*<Input\s+id="employee-contact".*?/>\s*</div>', re.S)
contact_replacement = """            <div className=\"space-y-2\">\n              <Label htmlFor=\"employee-contact\">Contact details</Label>\n              <div className=\"relative\">\n                <PhoneCall className=\"pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground\" />\n                <Input\n                  id=\"employee-contact\"\n                  value={formState.contact}\n                  onChange={(event) =>
                    handleFormChange('contact', event.target.value)
                  }
                  placeholder=\"Email or phone\"\n                  className=\"pl-9\"\n                />\n              </div>\n            </div>"""
text = contact_pattern.sub(contact_replacement, text, count=1)
path.write_text(text, encoding='utf-8')
