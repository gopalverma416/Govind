import { useEffect, useRef, useState } from "react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";

const CLIENT_ID = "855438909825-qc3vgibmpsijaa39vmsm0ag2gk700u2n.apps.googleusercontent.com";
const MAX_WIDTH = 400; // Google's button supports up to 400px

// "Continue with Google" button sized to its container; calls onCredential with the Google ID token
const GoogleButton = ({ onCredential, onError, text = "continue_with" }) => {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const measure = () => setWidth(Math.min(MAX_WIDTH, Math.floor(node.getBoundingClientRect().width)));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <div ref={ref} className="flex min-h-[44px] w-full justify-center overflow-hidden">
        {width > 0 && (
          <GoogleLogin
            key={width}
            onSuccess={(response) => onCredential(response.credential)}
            onError={onError}
            text={text}
            shape="pill"
            size="large"
            width={String(width)}
            logo_alignment="center"
          />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default GoogleButton;
