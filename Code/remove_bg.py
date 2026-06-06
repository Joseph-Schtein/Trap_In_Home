from PIL import Image

def remove_background(img_path):
    img = Image.open(img_path)
    img = img.convert('RGBA')
    data = img.getdata()
    
    bg_color = data[0]
    print(f'Background color seems to be {bg_color}')
    
    # We will use a small tolerance because white backgrounds in jpeg/png can sometimes vary by a bit
    new_data = []
    for item in data:
        # Check if the pixel color is close to the background color
        if abs(item[0] - bg_color[0]) < 10 and abs(item[1] - bg_color[1]) < 10 and abs(item[2] - bg_color[2]) < 10:
            new_data.append((255, 255, 255, 0)) # fully transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(img_path)

remove_background('../pictures/keys/KitchenKey.png')
