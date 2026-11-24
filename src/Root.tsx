import { registerRoot } from "remotion";
import { StillComposition } from "./StillFrames";
import { MyComposition } from "./Composition";

registerRoot(() => (
  <>
    <StillComposition />
    <MyComposition />
  </>
));