import geometry from "./geometry.json";
import PlotterLive from "./live";

export default function PenPlotter() {
  return <PlotterLive
    bed={<g key="plotter-bed" dangerouslySetInnerHTML={{ __html: geometry.bed }} />}
    gantry={<g key="plotter-gantry" dangerouslySetInnerHTML={{ __html: geometry.gantry }} />}
    head={<g key="plotter-head" dangerouslySetInnerHTML={{ __html: geometry.head }} />}
    trace={geometry.trace}
    samples={geometry.samples}
    axisX={geometry.axisX}
    axisY={geometry.axisY}
  />;
}
