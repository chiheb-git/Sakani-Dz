import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { getOrCreateDeviceId } from "./device/deviceId";
import { useLoginAnonymousClientMutation } from "./api/apiSlice";
import { clientSessionReady } from "../features/auth/authSlice";
import { saveAuthToken } from "./api/axiosInstance";

/** Silently establishes an anonymous client session tied to this device on first mount. */
export default function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const [loginAnonymous] = useLoginAnonymousClientMutation();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    (async () => {
      try {
        const deviceId = await getOrCreateDeviceId();
        const result = await loginAnonymous({ deviceId }).unwrap();
        await saveAuthToken(result.accessToken);
        dispatch(clientSessionReady({ clientId: result.userId, token: result.accessToken }));
      } catch (err) {
        console.warn("Anonymous session bootstrap failed:", err);
      }
    })();
  }, [dispatch, loginAnonymous]);

  return <>{children}</>;
}