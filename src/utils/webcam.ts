import { Stream } from 'stream';
declare global {
  interface Window {
    localStream: any;
  }
}
/**
 * Class to handle webcam
 */
export class WebcamOps {
  /**
   * Open webcam and stream it through video tag.
   * @param {React.MutableRefObject} videoRef video tag reference
   * @param {function} onLoaded callback function to be called when webcam is open
   */
  open = (
    videoRef: React.MutableRefObject<HTMLVideoElement | null | undefined>,
    onLoaded: any
  ) => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({
            audio: false,
            video: {
              facingMode: 'user',
            },
          })
          .then((stream) => {
            window.localStream = stream;
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              videoRef.current.onloadedmetadata = () => {
                onLoaded();
              };
            }
          });
      }
    } catch (err) {
      alert("Can't open Webcam!");
    }
  };

  /**
   * Close opened webcam.
   * @param {React.MutableRefObject} videoRef video tag reference
   */
  close = (
    videoRef: React.MutableRefObject<HTMLVideoElement | null | undefined>
  ) => {
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      window.localStream.getTracks().forEach((track: any) => {
        track.stop();
      });
      console.log('Closed');
    }
  };
}
