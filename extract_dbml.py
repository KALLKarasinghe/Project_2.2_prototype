import re

file_path = r'C:\Users\linuk\Downloads\pharma_network (3).sql'
with open(file_path, 'r', encoding='utf-8') as f:
    sql = f.read()

create_tables = re.findall(r'CREATE TABLE `([^`]+)` \((.*?)\) ENGINE=', sql, re.DOTALL)
alters = re.findall(r'ALTER TABLE `([^`]+)`(.*?;)', sql, re.DOTALL)

tables = {}
for t_name, t_body in create_tables:
    lines = t_body.split('\n')
    columns = []
    for line in lines:
        line = line.strip()
        if not line or line.startswith('--') or line.startswith('/*') or line.startswith('PRIMARY KEY') or line.startswith('KEY') or line.startswith('CONSTRAINT') or line.startswith('UNIQUE KEY'):
            continue
        # match column
        m = re.match(r'`([^`]+)`\s+([a-zA-Z0-9_]+(\(.*?\))?)(.*)', line)
        if m:
            col_name = m.group(1)
            col_type = m.group(2)
            rest = m.group(4)
            columns.append({'name': col_name, 'type': col_type, 'pk': False, 'rest': rest})
    tables[t_name] = columns

pks = {}
fks = []

for t_name, alter_body in alters:
    # Look for ADD PRIMARY KEY (`col`)
    pk_m = re.search(r'ADD PRIMARY KEY \(`([^`]+)`\)', alter_body)
    if pk_m:
        pks[t_name] = pk_m.group(1)
    
    # Look for foreign keys
    # ADD CONSTRAINT `...` FOREIGN KEY (`...`) REFERENCES `...` (`...`)
    fk_matches = re.finditer(r'FOREIGN KEY \(`([^`]+)`\) REFERENCES `([^`]+)` \(`([^`]+)`\)', alter_body)
    for fm in fk_matches:
        fks.append((t_name, fm.group(1), fm.group(2), fm.group(3)))

# If PK found in CREATE TABLE inline (not common in phpMyAdmin but possible)
for t_name, t_body in create_tables:
    pk_inline = re.search(r'PRIMARY KEY \(`([^`]+)`\)', t_body)
    if pk_inline:
         pks[t_name] = pk_inline.group(1)

for t_name, cols in tables.items():
    if t_name in pks:
        pk_col = pks[t_name]
        for c in cols:
            if c['name'] == pk_col:
                c['pk'] = True

dbml = ''
for t_name, cols in tables.items():
    dbml += f'Table {t_name} {{\n'
    for c in cols:
        settings = []
        if c['pk']:
            settings.append('primary key')
        if 'NOT NULL' in c['rest']:
            settings.append('not null')
        if settings:
            dbml += f"  {c['name']} {c['type']} [{', '.join(settings)}]\n"
        else:
            dbml += f"  {c['name']} {c['type']}\n"
    dbml += '}\n\n'

for t_from, c_from, t_to, c_to in fks:
    # In dbdiagram.io, relationships can be defined separately or inline.
    # We will output separately.
    dbml += f'Ref: {t_from}.{c_from} > {t_to}.{c_to}\n'

print(dbml)
