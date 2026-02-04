
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface RiskMeterProps {
  score: number;
}

const RiskMeter: React.FC<RiskMeterProps> = ({ score }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 200;
    const height = 120;
    const innerRadius = 70;
    const outerRadius = 90;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g")
      .attr("transform", `translate(${width / 2}, ${height - 10})`);

    const arc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    // Background track
    g.append("path")
      .attr("d", arc)
      .attr("fill", "#1e293b");

    // Color gradient based on score
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(["#10b981", "#f59e0b", "#ef4444"]);

    const foregroundArc = d3.arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(-Math.PI / 2)
      .endAngle((score / 100) * Math.PI - Math.PI / 2);

    g.append("path")
      .attr("d", foregroundArc)
      .attr("fill", colorScale(score));

    // Text score
    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.5em")
      .attr("class", "text-3xl font-bold fill-white")
      .style("font-size", "28px")
      .text(`${score}%`);

    g.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("class", "text-xs uppercase tracking-widest fill-slate-400")
      .style("font-size", "10px")
      .text("Risk Score");

  }, [score]);

  return (
    <div className="flex justify-center items-center bg-slate-900/50 p-4 rounded-xl border border-slate-800">
      <svg ref={svgRef} width="200" height="120"></svg>
    </div>
  );
};

export default RiskMeter;
