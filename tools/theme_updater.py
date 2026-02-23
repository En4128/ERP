import os
import re

def update_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        
        # --- 1. restore_light_mode.py Logic (Dual Mode Restoration) ---
        # Ensure we have dual mode syntax for key colors
        
        # Backgrounds: #1A1F2E -> #F3F4F6 (Light) / #1A1F2E (Dark)
        # Note: We use the NEW light mode color #F3F4F6 directly
        content = re.sub(r'(?<!dark:)bg-\[#1A1F2E\](?:/(\d+))?', 
                         lambda m: f'bg-[#F3F4F6]/{m.group(1)} dark:bg-[#1A1F2E]/{m.group(1)}' if m.group(1) 
                         else 'bg-[#F3F4F6] dark:bg-[#1A1F2E]', content)

        # Card Surfaces: #242B3D -> #E5E7EB (Light Card) / #242B3D (Dark Card)
        content = re.sub(r'(?<!dark:)bg-\[#242B3D\](?:/(\d+))?', 
                         lambda m: f'bg-[#E5E7EB]/{m.group(1)} dark:bg-[#242B3D]/{m.group(1)}' if m.group(1) 
                         else 'bg-[#E5E7EB] dark:bg-[#242B3D]', content)
        
        # Nested/Hover Surfaces: #2D3548 -> #F1F3F7
        content = re.sub(r'(?<!dark:)bg-\[#2D3548\](?:/(\d+))?', 
                         lambda m: f'bg-[#F1F3F7]/{m.group(1)} dark:bg-[#2D3548]/{m.group(1)}' if m.group(1) 
                         else 'bg-[#F1F3F7] dark:bg-[#2D3548]', content)

        # Text Primary: #E8EAED -> #0F1419
        content = re.sub(r'(?<!dark:)text-\[#E8EAED\]', 'text-[#0F1419] dark:text-[#E8EAED]', content)
        
        # Text Secondary: #B8BDC6 -> #475569
        content = re.sub(r'(?<!dark:)text-\[#B8BDC6\]', 'text-[#475569] dark:text-[#B8BDC6]', content)

        # Text Tertiary: #868D9D -> #64748B
        content = re.sub(r'(?<!dark:)text-\[#868D9D\]', 'text-[#64748B] dark:text-[#868D9D]', content)

        # Borders: #3D4556 -> #E2E5E9
        content = re.sub(r'(?<!dark:)border-\[#3D4556\](?:/(\d+))?', 
                         lambda m: f'border-[#E2E5E9]/{m.group(1)} dark:border-[#3D4556]/{m.group(1)}' if m.group(1) 
                         else 'border-[#E2E5E9] dark:border-[#3D4556]', content)

        # Primary Accent (Blue): #60A5FA -> #2563EB
        content = re.sub(r'(?<!dark:)bg-\[#60A5FA\](?:/(\d+))?', 
                         lambda m: f'bg-[#2563EB]/{m.group(1)} dark:bg-[#60A5FA]/{m.group(1)}' if m.group(1) 
                         else 'bg-[#2563EB] dark:bg-[#60A5FA]', content)
        
        content = re.sub(r'(?<!dark:)text-\[#60A5FA\]', 'text-[#2563EB] dark:text-[#60A5FA]', content)
        
        content = re.sub(r'(?<!dark:)border-\[#60A5FA\](?:/(\d+))?', 
                         lambda m: f'border-[#2563EB]/{m.group(1)} dark:border-[#60A5FA]/{m.group(1)}' if m.group(1) 
                         else 'border-[#2563EB] dark:border-[#60A5FA]', content)


        # --- 2. update_light_bg.py Logic ---
        # Ensure Light Mode BG is #F3F4F6 (Cool Gray) instead of #F8F9FB
        content = content.replace('bg-[#F8F9FB]', 'bg-[#F3F4F6]')


        # --- 3. refine_card_colors.py Logic (Heuristic for Cards) ---
        # Ensure cards (rounded items) use #E5E7EB instead of #F3F4F6 or #FFFFFF
        # This replaces: className="... rounded... bg-[#F3F4F6] ..." -> bg-[#E5E7EB]
        # And also: className="... rounded... bg-[#FFFFFF] ..." -> bg-[#E5E7EB]
        
        def refine_card_bg(m):
            cls_str = m.group(1)
            if 'rounded' in cls_str:
                # Replace incorrect card backgrounds
                if 'bg-[#F3F4F6]' in cls_str:
                    new_cls = cls_str.replace('bg-[#F3F4F6]', 'bg-[#E5E7EB]')
                    return f'className="{new_cls}"'
                if 'bg-[#FFFFFF]' in cls_str:
                     new_cls = cls_str.replace('bg-[#FFFFFF]', 'bg-[#E5E7EB]')
                     return f'className="{new_cls}"'
            return m.group(0)

        content = re.sub(r'className="([^"]*)"', refine_card_bg, content)


        # --- 4. General Cleanup ---
        # Remove any double dark:dark: patterns if we made them
        content = content.replace('dark:dark:', 'dark:')
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    dirs = [
        r'd:\project\erp\client\src\pages\student',
        r'd:\project\erp\client\src\pages\faculty'
    ]
    
    count = 0
    for d in dirs:
        if not os.path.exists(d): continue
        for filename in os.listdir(d):
            if filename.endswith('.jsx'):
                filepath = os.path.join(d, filename)
                if update_file(filepath):
                    print(f"Updated: {filename}")
                    count += 1
    
    print(f"Total processed: {count}")

if __name__ == "__main__":
    main()
