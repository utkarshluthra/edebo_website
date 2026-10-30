---
title: "How Accurate Is Smartphone 3D Face Scanning? What Studies Show"
description: "A clear summary of published studies comparing smartphone 3D face scans with clinical systems like Vectra and 3dMD, and what it means for clinics."
date: 2026-10-30
category: 3d-imaging
keyword: "smartphone 3D face scan accuracy"
tags: [3d imaging, accuracy, research, photogrammetry]
order: 4
faq:
  - q: "How accurate are smartphone 3D face scans?"
    a: "In a 2025 study comparing an iPhone 14 Pro with a Vectra M5 clinical system, photogrammetry-based phone scans showed a mean landmark deviation of about 0.8 mm. Other studies of phone apps against 3dMD systems report surface deviations around 1.5 mm. Results vary by app and capture method."
  - q: "What accuracy is clinically acceptable for facial 3D imaging?"
    a: "Many facial imaging studies treat deviations under 2 mm as clinically acceptable for soft-tissue assessment. Some research purposes and fine diagnostic tasks need tighter tolerances."
  - q: "Has Edebo published its own accuracy data?"
    a: "Edebo's own validation results will be published on edebo.in. The figures in this article come from independent published studies of smartphone 3D capture."
---

The first question any clinician asks about phone-based 3D scanning is simple: can I trust the numbers? It is the right question. A measurement tool is only useful if its measurements are close to reality and repeatable.

This article summarises what independent published research says, explains how accuracy is measured, and sets out what the evidence does and does not support. Edebo's own validation results will be published separately on our site.

## How accuracy is measured

Researchers usually compare a phone scan with a **reference system**, a clinical 3D rig such as Canfield's Vectra or a 3dMD system, which are themselves well validated. Common metrics:

- **Landmark-to-landmark deviation**: the distance between the same anatomical point (for example the tip of the nose) on the phone model and the reference model.
- **Surface deviation**: the average gap between the two surfaces after alignment, often reported as a mean or root mean square (RMS).
- **Volumetric difference**: how far apart the two systems are when measuring the same volume.
- **Agreement statistics** such as Bland-Altman limits or intraclass correlation (ICC), which show how consistently two methods agree.

A widely used threshold in facial soft-tissue work is **2 mm**: deviations below this are generally treated as clinically acceptable.

## What the studies found

### Hartmann et al., 2025: iPhone vs Vectra M5

Published in *Oral and Maxillofacial Surgery*, this study scanned 30 volunteers with a Vectra M5, with the iPhone 14 Pro's depth camera, and with iPhone photogrammetry.

- Photogrammetry models had a mean landmark deviation of about **0.8 mm** from the Vectra models.
- Depth-camera models had about **1.1 mm**.
- Mean volumetric difference was about **1.8 cc** for photogrammetry and **3.1 cc** for the depth camera.
- Most landmark measurements had 95% limits of agreement within 2 mm, while volume agreement was looser.

The authors concluded that both approaches show potential, with photogrammetry aligning better with the clinical system.

### Hartmann et al.: facial anthropometry

A related study by the same group compared 19 facial measurements between an iPhone app and the Vectra M5. Agreement was excellent, with ICC values between 0.85 and 0.97. Importantly, the authors also cautioned that phone-based anthropometry may not yet suit certain diagnostic purposes that demand very high accuracy. That is an honest boundary, and one we agree with.

### Seifert et al.: three iPhone apps vs 3dMD

Comparing three iPhone scanning apps with a stationary 3dMD system in 15 patients, this work reported mean surface deviations of roughly 1.5 to 1.7 mm and landmark deviations around 1.3 to 1.5 mm.

### Van Lint et al., 2023: five apps vs Vectra H1

Testing five apps on an iPad Pro against a portable Vectra H1 in 50 participants, researchers found wide variation: three apps showed sufficient accuracy, while others had linear differences of several millimetres.

## What this means in practice

Three conclusions stand out:

1. **Phone-based capture can come within the 2 mm range** used for clinical soft-tissue assessment, and in the best study, under 1 mm on landmarks.
2. **Method matters.** Photogrammetry generally outperformed depth sensors, and app quality varied a lot. "A phone scan" is not one thing.
3. **Volume is harder than distance.** Volumetric agreement is looser than landmark agreement, so very small volume changes should be read with care.

For aesthetic practice, where the main uses are consultation, documentation and follow-up comparison, this level of accuracy is useful. You can see a cheek filler's effect as a measured change, check symmetry, and show progress across visits. Read how that works in [measuring aesthetic results in millimetres](/blog/measuring-aesthetic-results-in-millimetres/).

## Accuracy vs repeatability

For follow-up work, **repeatability** often matters more than absolute accuracy. If the same system scans the same face twice and gets nearly the same model, then a change between Day 0 and Day 30 reflects the patient, not the tool. Repeatability depends heavily on consistent capture: same lighting, neutral expression, similar head position. Our [capture tips](/blog/3d-scan-lighting-and-capture-tips/) are written with this in mind.

## The boundary we hold

Edebo is a **measurement and visualisation tool, not a diagnostic device**. The studies above support using phone-based 3D models to document and compare soft-tissue shape. They do not turn a phone into a diagnostic instrument, and we do not claim they do.

If you are comparing systems, ask every vendor for the same things: the reference system used, the metric reported, the sample size, and whether the result was published. Our [rig vs smartphone comparison](/blog/3d-imaging-rig-vs-smartphone/) lists the other questions worth asking.

### Sources

- Hartmann R. et al. Evaluating smartphone-based 3D imaging techniques for clinical application in oral and maxillofacial surgery: a comparative study with the Vectra M5. *Oral and Maxillofacial Surgery*, 2025. [doi:10.1007/s10006-024-01322-2](https://doi.org/10.1007/s10006-024-01322-2)
- Hartmann R. et al. Utility of smartphone-based three-dimensional surface imaging for digital facial anthropometry. [DOAJ](https://doaj.org/article/5cd5cc45218545b5a2b31c704c466e93)
- Van Lint L. et al. Accuracy comparison of 3D face scans obtained by portable stereophotogrammetry and smartphone applications. 3DBODY.TECH 2023. [Abstract](https://proc.3dbody.tech/abstracts/2023/2370vanlint.html)
