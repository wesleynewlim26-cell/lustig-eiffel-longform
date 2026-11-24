import { Composition, HtmlInCanvas } from "remotion";
import { drawFrame } from "./Composition";

const SCENE_ENDS = [300, 750, 1200, 1650, 2100, 2550, 3000, 3450, 3900, 4350, 4800, 5100, 5400];
const SCENE_STARTS = [0, 300, 750, 1200, 1650, 2100, 2550, 3000, 3450, 3900, 4350, 4800, 5100];

const StillFrame = ({ sceneIndex }: { sceneIndex: number }) => {
  const startFrame = SCENE_STARTS[sceneIndex];
  const endFrame = SCENE_ENDS[sceneIndex];
  const middleFrame = startFrame + Math.floor((endFrame - startFrame) / 2);
  const progress = middleFrame / 5400;
  
  return (
    <HtmlInCanvas
      width={1280}
      height={720}
      onPaint={(params: any) => {
        const canvas = params.canvas || params;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        drawFrame(ctx, 1280, 720, progress, middleFrame);
      }}
    >
      <div />
    </HtmlInCanvas>
  );
};

export const StillComposition = () => (
  <>
    {SCENE_ENDS.map((_, i) => (
      <Composition
        key={i}
        id={`Scene${i+1}Still`}
        component={(props) => <StillFrame {...props} sceneIndex={i} />}
        durationInFrames={1}
        fps={30}
        width={1280}
        height={720}
        calculateMetadata={() => ({ durationInFrames: 1, fps: 30, width: 1280, height: 720 })}
      />
    ))}
  </>
);

export const MyComponent = () => null;