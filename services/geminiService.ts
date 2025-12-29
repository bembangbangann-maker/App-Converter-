import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAppIcon = async (appName: string, description: string): Promise<string> => {
  try {
    const prompt = `Design a modern, minimalist, high-quality app icon for an application named "${appName}". 
    Description of app: ${description}. 
    Style: Vector art, vibrant colors, rounded square shape, professional UI design suitable for iOS and MacOS.
    Do not include text inside the icon.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data received");
  } catch (error) {
    console.error("Icon generation failed:", error);
    throw error;
  }
};

export const generateSplashScreen = async (appName: string, description: string): Promise<string> => {
    try {
      const prompt = `Design a professional mobile app launch screen (splash screen) for "${appName}".
      Description: ${description}.
      Style: Minimalist, clean background, modern vector logo centered, vertical orientation.
      Resolution: High quality.`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "9:16"
          }
        }
      });
  
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      throw new Error("No image data received");
    } catch (error) {
      console.error("Splash generation failed:", error);
      throw error;
    }
};

export const enhanceDescription = async (currentDesc: string, appName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite the following app description to be professional, concise, and marketing-ready for an App Store listing. 
      App Name: ${appName}.
      Current Draft: ${currentDesc || "A useful web application."}.
      Keep it under 40 words.`,
    });
    return response.text?.trim() || currentDesc;
  } catch (error) {
    console.error("Text enhancement failed:", error);
    return currentDesc;
  }
};

export const generatePrivacyPolicy = async (appName: string, permissions: string[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Write a standard Privacy Policy for a mobile application named "${appName}".
            The app uses the following permissions: ${permissions.join(', ')}.
            Include sections for: Information Collection, Use of Information, and Security.
            Format: Markdown.
            Keep it generic but professional.`,
        });
        return response.text?.trim() || "# Privacy Policy";
    } catch (error) {
        console.error("Privacy Policy generation failed:", error);
        return "# Privacy Policy\n\nCould not generate policy.";
    }
};

export const generateReadme = async (appName: string, permissions: string[]): Promise<string> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a Markdown README.md for a developer converting the web app "${appName}" to a standalone app.
      
      Sections required:
      1. Desktop (Electron): How to install dependencies and run (npm start).
      2. Mobile (Capacitor): 
         - Explain that the user needs to run 'npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios'.
         - Explain how to generate the 'android' folder using 'npx cap add android'.
         - Explain how to build the APK using 'npx cap open android' (which opens Android Studio) or 'npx cap run android'.
         - Mention that for iOS, they use 'npx cap add ios' and 'npx cap open ios'.
      3. Assets: Mention the generated icon and splash screen.
      4. Privacy: Mention the generated privacy policy.
      
      The app requires these permissions: ${permissions.join(', ')}.
      Keep it clear and developer-friendly.`,
    });
    return response.text?.trim() || "# Readme";
  } catch (error) {
    console.error("Readme generation failed:", error);
    return "# Readme\n\nFailed to generate content.";
  }
}