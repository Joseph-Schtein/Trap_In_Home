from PIL import Image
import os

img_path = r"c:\Users\yossi\OneDrive\שולחן העבודה\master degree\second semaster\AI\Ex3\pictures\keys\entranceDoorKey.png"
if os.path.exists(img_path):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    # Assume the background color is the top-left pixel
    bg_color = data[0]
    
    new_data = []
    for item in data:
        if abs(item[0] - bg_color[0]) < 40 and \
           abs(item[1] - bg_color[1]) < 40 and \
           abs(item[2] - bg_color[2]) < 40:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path, "PNG")
    print("Background removed successfully.")
else:
    print("Image not found.")
