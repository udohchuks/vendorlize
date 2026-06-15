# Vendorlize: Phasion Sense

Vendorlize is a luxury bespoke virtual try-on studio and digital catalog interface designed for local merchants. It enables customers to scan their silhouettes, simulate virtual try-ons, and place direct customized orders with merchants.

---

## 🚀 How to Run the Code Locally

You can run the application locally in just a few steps. **No API keys or external configurations are required** to test or use the full suite of features!

### 📋 Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (installed automatically with Node.js)

### ⚙️ Installation & Setup

1. **Clone or navigate to the repository directory:**
   ```bash
   cd vendorlize
   ```

2. **Install the dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open the application:**
   Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application in action.

---

## 🔌 Why No API Setup is Needed

The project is designed to run completely out-of-the-box:
- **Pre-configured Environment**: The application utilizes pre-defined sandbox parameters. If an `.env` file exists with `AGNES_API_KEY`, it will use it to call the Agnes AI image model. Otherwise, the app operates gracefully by utilizing the fallback mode.
- **Resilient Fallback Design**: If the external Agnes AI endpoints are unreachable or run without keys, the app automatically switches to **Interactive Draping Overlay Mode**. This ensures that the user experience is never blocked.

---

## 🎨 How the Try-On Feature Works

The **Clothify Studio Try-On** feature allows customers to visualize garments on physical silhouettes using a dual-mode engine:

```mermaid
graph TD
    A[Start Try-On Simulation] --> B{Choose Model Source}
    B -- AI Model Avatar --> C[Load Silhouette Avatar by Gender & Body Type]
    B -- Custom Photo Upload --> D[Initialize AI Body Scanner]
    D --> E[Scans Portrait & Auto-updates Tailoring Measurements]
    C --> F[Select Wishlist Apparel & Click 'Render Sizing Fit']
    E --> F
    F --> G[POST request to /api/tryon]
    G --> H{Try-on API Route}
    H -- Step 1: Attempt Agnes AI --> I[Connect to 'apihub.agnes-ai.com' using model 'agnes-image-2.1-flash']
    I -- Success --> J[Return Synthesized AI Image]
    I -- Fails / Offline --> K[Step 2: Local Fallback Mode]
    K --> L[Initialize Client-Side Interactive Draping Overlay]
    L --> M[User adjusts scale and position of garment layer manually]
    J --> N[Simulation Render complete]
    M --> N
    N --> O[Share tailored coordinates & render link via WhatsApp direct to merchant]
```

### 1. The Processing Pipeline
- **AI Body Scanner**: When a user uploads a portrait, a simulated scanner estimates body dimensions (Chest, Waist, Hips, Height, Inseam) based on alignment joints, writing tailored metrics directly to the user's local context.
- **Route Handler (`/api/tryon`)**: The frontend calls this Next.js API route with a person's image and a garment image.
- **Agnes AI Image Model API**:
  - The route connects to Sapiens / Agnes AI API at `https://apihub.agnes-ai.com/v1/images/generations`.
  - It utilizes the **Agnes Image 2.1 Flash** model (`agnes-image-2.1-flash`) with standard image-to-image parameters, passing the absolute URL/Data URIs of the person and garment inside the input `image` array in the `extra_body` payload.
  - Returns the URL of the synthesized try-on result on success.

### 2. The Client-Side Fallback (Interactive Draping)
If the AI model is offline or returns an error, the studio recovers gracefully:
- It launches **Interactive Draping Mode** directly in the browser.
- The garment is rendered as a transparent, high-quality layer overlaying the target silhouette.
- The user can **drag to position** the garment and use a **precision slider** to scale the garment up/down to visually inspect the size fit.

### 3. Tailored Merchant Checkout
Once the simulation is complete, the user can click **Share Fit**. This automatically compiles the custom tailoring coordinates (from their profile) and the try-on simulation link into a custom template and launches a pre-configured **WhatsApp message** directly to the merchant to place a bespoke order.

