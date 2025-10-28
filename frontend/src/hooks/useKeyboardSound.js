import soundManager from "../lib/soundManager.js";
import { useChatStore } from "../store/useChatStore.js";

function useKeyboardSound() {
  const { isSoundEnabled } = useChatStore();

  const playRandomKeyStrokeSound = () => {
    if (isSoundEnabled) {
      soundManager.playKeystroke();
    }
  };

  return { playRandomKeyStrokeSound };
}

export default useKeyboardSound;
