# Implementation Plan: Export Canvas to High-Res Image (PNG)

Adding the ability to export the current Canvas as a high-resolution image is a quick win that adds immense value for users wanting to include their ER diagrams in documentation, READMEs, or presentations.

## 1. Install Dependencies
We will use `html-to-image`, which is the industry standard for capturing React Flow canvases reliably (and recommended by the React Flow team over `html2canvas`).
```bash
cd frontend
npm install html-to-image
```

## 2. Create the Export Utility Service
Create a new service `frontend/src/features/canvas/services/exportImage.service.ts`:
- **Functionality**: Access the `.react-flow__viewport` DOM element, apply the `html-to-image` `toPng` method, and trigger a browser download.
- **Styling considerations**: We need to temporarily enforce a transparent or specific background color for the capture, and ensure the nodes render fully at 1x or 2x scale (to ensure it's high-res).

## 3. Add the "Export Image" Action to the UI
We will add a "Download Image" option in two strategic places:
1. **The Canvas Toolbar**: Add an Image icon button (using `lucide-react`) next to the other actions in `CanvasToolbar.tsx`.
2. **The Workspace Header Menu**: Add a "Download Image (PNG)" item to the `isMenuOpen` dropdown inside `WorkspaceCanvas.tsx`, right beneath "Export Schema".

## 4. Hook up the Functionality
- In `WorkspaceCanvas.tsx`, we can wrap the Canvas `div` in a ref if necessary, but `html-to-image` allows us to simply query the DOM for `.react-flow__viewport` directly.
- Ensure that the action gracefully catches and handles errors (e.g. if the canvas is completely empty).
- Provide a Toast notification: "Downloading image..." followed by "Image downloaded successfully!".

## 5. Testing & Polish
- **Check Dark/Light mode**: Ensure the exported PNG has an appropriate background color (or transparency) so text remains readable.
- **Check Boundaries**: React Flow has a neat trick where we can call `getNodesBounds` to correctly size the viewport capture window, stripping out empty white space.

---
**Estimated Effort:** ~15-20 minutes
**Impact:** High (Great for sharing and visibility)
