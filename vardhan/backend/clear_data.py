import sqlite3
import os
import shutil

# Clear database
db_path = r'c:\Users\91862\OneDrive\Desktop\vardhan\database\attendance.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute('DELETE FROM students')
conn.commit()
deleted_count = cursor.rowcount
conn.close()
print(f'✓ Deleted {deleted_count} student(s) from database')

# Clear training images
training_dir = r'c:\Users\91862\OneDrive\Desktop\vardhan\backend\TrainingImage'
if os.path.exists(training_dir):
    for item in os.listdir(training_dir):
        item_path = os.path.join(training_dir, item)
        if os.path.isdir(item_path):
            shutil.rmtree(item_path)
            print(f'✓ Deleted folder: {item}')

# Clear trained model
model_path = r'c:\Users\91862\OneDrive\Desktop\vardhan\backend\face_model.yml'
if os.path.exists(model_path):
    os.remove(model_path)
    print('✓ Deleted trained model file')
else:
    print('ℹ No trained model file found')

print('\n🎯 All data cleared! You can now register students fresh.')
