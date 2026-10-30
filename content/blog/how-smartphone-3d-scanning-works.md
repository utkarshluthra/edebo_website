---
title: "How Smartphone 3D Scanning Works: Photogrammetry Explained"
description: "A plain-language explanation of how a smartphone turns video frames into a measurable 3D model of the face or body, and what affects scan quality."
date: 2026-06-09
category: 3d-imaging
keyword: "smartphone 3D scanning"
tags: [3d imaging, photogrammetry, technology, capture]
faq:
  - q: "How can a phone create a 3D model?"
    a: "The phone records many overlapping images while it moves around the subject. Software matches the same features across those images and uses the change in viewpoint to calculate depth, a process called photogrammetry."
  - q: "Does smartphone 3D scanning need LiDAR?"
    a: "Not necessarily. Photogrammetry works from ordinary camera images. Depth sensors such as LiDAR or front-facing infrared cameras can help, but published research has found photogrammetry-based face models align more closely with clinical rigs than depth-sensor models."
  - q: "How long does a smartphone face scan take?"
    a: "The capture itself takes seconds: a slow, steady pass around the head. Processing into a measurable model follows automatically."
---

Point a phone at a face, move it slowly, and a few seconds later you have a 3D model you can rotate and measure. It looks like magic, but the method behind it, **photogrammetry**, is more than a century old. What is new is that a phone now has enough camera quality and computing power to do it inside a consultation.

Here is how it works, in plain language.

## Step 1: Capture many overlapping views

During a scan, the phone records a stream of frames as it moves around the subject. Each frame sees the face from a slightly different position. The key requirement is **overlap**: every part of the face should appear in several frames from different angles.

This is why scanning instructions always say "move slowly". Fast movement causes motion blur and leaves gaps between viewpoints.

## Step 2: Find matching points

Software looks for distinctive features in each frame: the corner of an eye, a freckle, the edge of a nostril, fine skin texture. It then finds the same features in neighbouring frames.

Thousands of these matches are found across the capture. Skin with natural texture gives the software plenty to work with. Very shiny or very uniform surfaces give it less, which is one reason [lighting matters so much](/blog/3d-scan-lighting-and-capture-tips/).

## Step 3: Work out where the camera was

From the matched points, the software solves a geometry problem: where must the camera have been for each frame for all these matches to line up? This step, often called structure from motion, recovers the camera path and a sparse cloud of 3D points at the same time.

## Step 4: Build a dense surface

With camera positions known, the software calculates depth for many more pixels and fills in a **dense point cloud**: thousands of depth points across the face. Those points are joined into a triangle mesh, which is the actual 3D surface.

## Step 5: Add texture and set real-world scale

Colour from the original frames is projected onto the mesh, so the model looks like the patient rather than a grey sculpture. The model is also scaled to real-world units so that a measured distance means millimetres, not arbitrary units. Without correct scale, volume and distance measurements would be meaningless.

## Step 6: Measure and compare

Now the model is a measurable object. Software can:

- measure distances, angles and areas,
- mirror one side onto the other for [symmetry analysis](/blog/facial-symmetry-analysis-3d/),
- align two scans from different visits and show a colour map of change, which is the basis of [measuring aesthetic results in millimetres](/blog/measuring-aesthetic-results-in-millimetres/).

## Photogrammetry vs depth sensors

Some phones have depth hardware: LiDAR on the rear of certain models, or an infrared depth camera on the front. These measure distance directly instead of inferring it.

Depth sensors are fast and work on low-texture surfaces, but their resolution is limited. Photogrammetry can recover finer surface detail when capture conditions are good. A 2025 study in *Oral and Maxillofacial Surgery* by Hartmann and colleagues compared both approaches on an iPhone 14 Pro against a Canfield Vectra M5 clinical system in 30 volunteers. Photogrammetry models showed a mean landmark deviation of about 0.8 mm, against about 1.1 mm for the depth camera, and also tracked volume more closely. We summarise this and other studies in [how accurate is smartphone 3D face scanning](/blog/how-accurate-is-smartphone-3d-face-scanning/).

## What affects scan quality

Most poor scans come from capture conditions, not the phone:

- **Lighting**: even, diffuse light is best. Strong backlight from a window or a single harsh overhead lamp creates shadows the software reads as shape.
- **Movement**: the patient must stay still; the phone should move smoothly.
- **Hair and accessories**: loose hair over the forehead, earrings and glasses confuse matching. Tie hair back unless the hairline is the subject.
- **Makeup and shine**: heavy foundation can hide skin texture; oily shine creates reflections.
- **Coverage**: missing the underside of the chin or the side of the nose leaves holes.

## Why this matters for clinics

The practical result is that a clinic no longer needs a fixed multi-camera room to produce a measurable 3D record. Any room with adequate light becomes a capture space. That changes the cost, as we show in [the cost of 3D imaging for clinics in India](/blog/cost-of-3d-imaging-for-clinics-india/), and it changes workflow: the scan fits inside the consultation instead of needing a separate imaging session.

Edebo uses this approach to turn the smartphone already in your clinic into a 3D scanner for the face, hairline and body, with the model ready before the patient leaves the chair.
