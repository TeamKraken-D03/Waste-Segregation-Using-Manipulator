# Waste Segregation Using uFactory Lite 6 Manipulator

This project automates the waste segregation process using a **uFactory Lite 6** robotic manipulator. The system captures an image of the workspace, segments the image using the **Gemini Vision Transformer**, and guides the manipulator to pick and place objects based on their classification.

---

## Team Members

| Name              | Roll Number |
|-------------------|-------------|
| *Renny Harlin D*       | *CB.SC.U4AIE23334* |
|                   |             |
|                   |             |
|                   |             |

---

## 🤖 Hardware & Tools Used

- **uFactory Lite 6** robotic arm
- External RGB camera
- Colored cubes representing different waste types
- Python, OpenCV, and xArmAPI
- Gemini Vision Transformer (image segmentation)
- Homography-based coordinate transformation

---

## 📌 Project Workflow

1. **Capture Workspace Image**
   - An RGB camera captures the top-down view of the workspace.

2. **Segment the Image**
   - The image is segmented using the **Gemini Vision Transformer** model.
   - Bounding boxes are generated for each object (e.g., colored cube).

3. **Centroid Detection**
   - The centroid of each object is calculated from the bounding boxes.

4. **Coordinate Transformation**
   - Camera frame coordinates are mapped to the robot's coordinate frame using a **homography matrix**.

5. **Manipulator Control**
   - The uFactory Lite 6 moves to the object's location, picks it up, and places it in the appropriate box based on color/type.

---

