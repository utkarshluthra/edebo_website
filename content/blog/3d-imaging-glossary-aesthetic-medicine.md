---
title: "3D Imaging Glossary for Aesthetic Medicine: 40 Terms Explained"
description: "Plain-language definitions of the 3D imaging terms clinicians meet when evaluating scanning systems, from photogrammetry and point clouds to RMS and Bland-Altman."
date: 2026-09-18
category: 3d-imaging
keyword: "3D imaging terms"
tags: [3d imaging, basics, glossary, accuracy]
faq:
  - q: "What is a mesh in 3D imaging?"
    a: "A mesh is the surface of a 3D model, made of many small connected triangles. It is built from a point cloud and is what you measure on."
  - q: "What does RMS mean in 3D scan accuracy?"
    a: "RMS, or root mean square, is an average of the deviations between two surfaces that gives more weight to larger errors. Lower RMS means the surfaces match more closely."
  - q: "What is a superimposition in aesthetic imaging?"
    a: "Superimposition, or overlay, aligns two 3D scans of the same patient, usually from different visits, so the difference between them can be seen and measured."
---

Vendor brochures and research papers on 3D imaging use a lot of jargon. This glossary explains the terms you are most likely to meet, in plain language, grouped by topic. Bookmark it for your next vendor demo.

## Capture

**3D surface imaging**: recording the outer shape of the face or body as a digital model. See [what is 3D facial imaging](/blog/what-is-3d-facial-imaging/).

**Photogrammetry**: building a 3D model from many overlapping 2D images by matching features and calculating depth. Explained in [how smartphone 3D scanning works](/blog/how-smartphone-3d-scanning-works/).

**Stereophotogrammetry**: photogrammetry using two or more cameras that fire at the same instant from known positions. The basis of most fixed clinical rigs.

**Structured light**: a scanner projects a known pattern onto the surface and measures how it bends to compute depth.

**LiDAR**: light detection and ranging; measures distance by timing reflected laser pulses. Present on some phones and tablets.

**TrueDepth / infrared depth camera**: a front-facing phone sensor that projects infrared dots to measure depth, originally built for face unlock.

**Structure from motion (SfM)**: the step that works out where the camera was for each frame while also recovering rough 3D points.

**Capture pass**: the movement of the phone or scanner around the subject during a scan.

**Frankfort horizontal plane**: a clinical reference line from the top of the ear canal to the lowest point of the eye socket. Keeping it level helps standardise head position.

## Model

**Point cloud**: a set of 3D points sampled from the surface. "Dense" point clouds have many thousands of points.

**Mesh**: a surface made of connected triangles built from the point cloud. This is the model you rotate and measure.

**Vertex**: a single corner point of a mesh triangle.

**Texture map**: the colour image wrapped onto the mesh so the model looks like the patient.

**Resolution**: how fine the detail of the model is; roughly, how close together the points are.

**Scale**: the link between model units and real millimetres. Without correct scale, measurements are meaningless.

**Hole / gap**: an area the capture missed, often under the chin or beside the nose. See [capture tips](/blog/3d-scan-lighting-and-capture-tips/).

**STL / OBJ / PLY**: common 3D file formats. OBJ and PLY can carry colour; STL usually does not.

## Measurement

**Landmark**: a defined anatomical point, such as the tip of the nose (pronasale) or the corner of the mouth (cheilion).

**Linear measurement**: a straight-line distance between two landmarks, in millimetres.

**Surface (geodesic) distance**: the distance measured along the skin surface rather than through the air.

**Volume difference**: the volume between two aligned surfaces, used to measure filler, swelling or fat reduction. See [dermal filler volume measurement](/blog/dermal-filler-volume-measurement-3d/).

**Colour map / heat map**: a visual of how far two surfaces are apart at each point, often with one colour for added volume and another for lost volume.

**Symmetry analysis**: mirroring one half of the face onto the other and measuring the differences. See [facial symmetry analysis](/blog/facial-symmetry-analysis-3d/).

**Projection**: how far a feature stands out from a reference plane, such as chin or cheek projection.

**Annotation**: marks, lines and notes placed directly on the 3D model.

## Comparison

**Registration / alignment**: positioning two scans so the same anatomy lines up, usually using stable regions like the forehead and nose bridge.

**Superimposition / overlay**: displaying two aligned scans together to show change.

**Day 0 / baseline**: the first scan before treatment, against which all follow-ups are compared.

**Reference regions**: areas assumed not to change between visits, used to align scans.

## Accuracy and statistics

**Trueness**: how close a measurement is to the real value, often judged against a reference system.

**Precision / repeatability**: how close repeated measurements of the same thing are to each other.

**Reference (gold standard) system**: a well-validated system, such as a clinical rig, used to test a new one.

**Mean deviation**: the average distance between matching points on two models.

**RMS (root mean square)**: an average of deviations that weights larger errors more heavily.

**Bland-Altman analysis / limits of agreement**: a method that shows how far two measurement methods can disagree for most measurements, often stated as 95% limits.

**ICC (intraclass correlation coefficient)**: a score from 0 to 1 showing how consistently two methods agree; values above about 0.9 are usually called excellent.

**Clinically acceptable threshold**: the error below which a measurement is considered good enough for clinical use. In facial soft-tissue work, 2 mm is widely used. Read the evidence in [how accurate is smartphone 3D face scanning](/blog/how-accurate-is-smartphone-3d-face-scanning/).

## Data and privacy

**Biometric data**: data about physical characteristics, including facial geometry. Treat 3D scans as sensitive.

**Data fiduciary**: under India's DPDP Act, the entity that decides why and how personal data is processed. For patient scans, that is usually the clinic.

**Data processor**: an entity that processes data on behalf of the fiduciary, such as an imaging software provider.

**Pseudonymisation**: storing scans separately from names and identifiers so that a breach of one does not expose the other.

**Data localisation**: keeping data stored and processed within India. For your obligations, see [the DPDP Act and patient photos](/blog/dpdp-act-patient-photos-aesthetic-clinics/).
