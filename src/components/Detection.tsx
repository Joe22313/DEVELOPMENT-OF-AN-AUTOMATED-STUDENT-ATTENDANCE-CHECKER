import React, {
  useState,
  useEffect,
  useRef,
  RefObject,
  Dispatch,
  SetStateAction,
} from 'react';
import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-backend-webgl'; // set backend to webgl
import Loader from './Loader';
import { WebcamOps } from '../utils/webcam';
// import Webcam from 'react-webcam';

import { renderBoxes } from '../utils/renderBox';
import { non_max_suppression } from '../utils/nonMaxSuppression';
// import '../styles/App.css';
import { useNavigate } from 'react-router-dom';
import { ContextType, Capture } from 'utils/Interfaces';

function shortenedCol(arrayofarray: any, indexlist: any) {
  return arrayofarray.map(function (array: number[]) {
    return indexlist.map(function (idx: number) {
      return array[idx];
    });
  });
}

const Detection = ({
  handleSubmit,
  videoRef,
  captures,
  setCaptures,
  setIsGalleryOpen,
  webcamOps, setIsDetecting
}: {
  handleSubmit: () => void;
  videoRef: RefObject<HTMLVideoElement>;
  captures: Capture[];
  setCaptures: Dispatch<SetStateAction<Capture[]>>;
  setIsGalleryOpen: Dispatch<SetStateAction<boolean>>;
  webcamOps: WebcamOps;
  setIsDetecting: Dispatch<SetStateAction<boolean>>;
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({ loading: true, progress: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLCanvasElement>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string>();
  const model_dim: [number, number] = [640, 640];
  const liveDetection = useRef<boolean>(true);

  const w = 640;
  const h = 640;

  // configs
  const modelName = 'Cavity Detection';
  const threshold = 0.6;

  const detectFrame = async (model: tf.GraphModel) => {
    const start = performance.now();

    if (!liveDetection.current) return;
    // execute f()
    try {
      tf.engine().startScope();
      const input = tf.tidy(() => {
        if (videoRef.current) {
          const img = tf.image
            .resizeBilinear(tf.browser.fromPixels(videoRef.current), model_dim)
            .div(255.0)
            .transpose([2, 0, 1])
            .expandDims(0);
          return img;
        }
      });

      if (input) {
        await model.executeAsync(input).then((res: any) => {
          res = res.arraySync()[0];
          var detections = non_max_suppression(res);
          const boxes = shortenedCol(detections, [0, 1, 2, 3]);
          const scores = shortenedCol(detections, [4]);
          const class_detect = shortenedCol(detections, [5]);
          if (
            //check if the parameters are 2d
            canvasRef &&
            boxes[0] !== Array &&
            scores[0] !== Array &&
            class_detect[0] !== Array
          ) {
            renderBoxes(canvasRef, threshold, boxes, scores, class_detect);
          }
          tf.dispose(res);
        });
      }
      requestAnimationFrame(() => detectFrame(model)); // get another frame
    } catch (e) {
      console.log('Detection Error', e);
    }
    tf.engine().endScope();
    console.log(performance.now() - start);
  };

  const capture = () => {
    const mainCanvas = canvasRef.current!;

    if (!mainCanvas) return;
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
    }, 10);
    const w = mainCanvas.width;
    const h = mainCanvas.height;

    const mainCtx = mainCanvas.getContext('2d') as CanvasRenderingContext2D;

    // create a copy of the canvas
    const boxCanvas = document.createElement('canvas');
    boxCanvas.height = h;
    boxCanvas.width = w;

    const boxCtx = boxCanvas.getContext('2d') as CanvasRenderingContext2D;

    boxCtx.drawImage(mainCanvas, 0, 0);
    // draw the current frame
    mainCtx.drawImage(videoRef.current!, 0, 0, w, h);

    // draw bounding boxes
    mainCtx.drawImage(boxCtx.canvas, 0, 0, w, h);

    const imageUrl = mainCanvas.toDataURL('image/jpeg', 1);

    setScreenshotUrl(mainCanvas.toDataURL('image/jpeg', 1));

    setCaptures((prev) => [{ url: imageUrl, location: '', name: '' }, ...prev]);

    boxCtx.clearRect(0, 0, w, h);
    mainCtx.clearRect(0, 0, w, h);
  };

  useEffect(() => {
    if (!liveDetection.current) return;
    const mainCanvas = canvasRef.current!;
    mainCanvas.width = w;
    mainCanvas.height = h;
    tf.loadGraphModel(`models/model.json`, {
      onProgress: (fractions) => {
        setLoading({ loading: true, progress: fractions });
      },
    })
      .then(async (yolov7) => {
        // Warmup the model before using real data.
        if (yolov7.inputs[0].shape && videoRef) {
          const dummyInput = tf.ones(yolov7.inputs[0].shape);
          const warmupResult = await yolov7.execute(dummyInput);
          tf.dispose(warmupResult);
          tf.dispose(dummyInput);
          setLoading({ loading: false, progress: 1 });
          webcamOps.open(videoRef, () => detectFrame(yolov7));
        }
      })
      .catch((e) => {});
  }, []);

  console.warn = () => {};
  useEffect(() => {
    window.addEventListener('keydown', (event) => {
      if (event.code == 'Space') capture();
    });
  }, []);

  const handleCloseCam = () => {
    webcamOps.close(videoRef);
    setIsDetecting(false)
    liveDetection.current = false;
  };

  return (
    <>
      <div className="flex justify-center items-center flex-col w-full">
        {loading.loading ? (
          <Loader>{(loading.progress * 100).toFixed(2)}%</Loader>
        ) : (
          <p></p>
        )}
        <div
          className={`relative flex justify-center bg-gray-500 h-[640px] w-[640px]`}
        >
          {isCapturing && (
            <div className="w-full h-full bg-white opacity-80 absolute top-0 left-0 "></div>
          )}
          <video
            className={`h-[640px] w-[640px]`}
            autoPlay
            playsInline
            muted
            ref={videoRef}
            id="frame"
          />
          <canvas
            className="absolute top-0 left-0 w-full h-full"
            ref={canvasRef}
          />
          <canvas className="absolute top-0 left-0 boxCanvas" ref={boxRef} />
        </div>
        <button
                onClick={handleCloseCam}
                className="bg-red-400 font-bold text-2xl rounded-lg text-white py-3 px-10 w-fit"
              >
                Stop
        </button>
      </div>
    </>
  );
};

export default Detection;
