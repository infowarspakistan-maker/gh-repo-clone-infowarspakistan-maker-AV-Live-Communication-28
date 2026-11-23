import React from 'react';
import {
  MeasurementUnit,
  ROOM_ENDPOINTS,
  RoomDesignerState,
  RoomEngineeringReport,
  formatDim,
} from '../lib/room-designer-catalog';
import { RoomOverlayFlags } from './ConferenceRoom3DCanvas';

interface ConferenceRoom2DPlanProps {
  state: RoomDesignerState;
  report: RoomEngineeringReport;
  overlays: RoomOverlayFlags;
  unit: MeasurementUnit;
}

const TABLE_FILL: Record<RoomDesignerState['tableFinish'], string> = {
  oak: '#d8b080',
  walnut: '#734d34',
  birch: '#efe1c9',
  charcoal: '#383e4a',
};

export const ConferenceRoom2DPlan: React.FC<ConferenceRoom2DPlanProps> = ({
  state,
  report,
  overlays,
  unit,
}) => {
  const endpoint =
    ROOM_ENDPOINTS.find((e) => e.slug === state.endpointSlug) || ROOM_ENDPOINTS[3];

  const pad = 1.1; // meters padding around room bounds for dimension lines
  const vbW = state.roomWidthM + pad * 2;
  const vbH = state.roomLengthM + pad * 2;
  const toX = (roomX: number) => pad + state.roomWidthM / 2 + roomX;
  const toY = (roomZ: number) => pad + roomZ;

  const roomLeft = pad;
  const roomTop = pad;
  const roomW = state.roomWidthM;
  const roomH = state.roomLengthM;

  const tStart = state.tableOffsetFromWallM;
  const tMidZ = tStart + state.tableLengthM / 2;

  // FOV wedge geometry
  const halfFovRad = ((endpoint.fovDeg / 2) * Math.PI) / 180;
  const fovReach = Math.min(state.roomLengthM - 0.1, endpoint.maxOpticalDistanceM);
  const halfSpread = Math.tan(halfFovRad) * fovReach;

  // Viewing corridor arc path helper
  const minD = report.minViewingDistM;
  const maxD = Math.min(state.roomLengthM - 0.1, report.maxViewingDistM);
  const startAngle = -Math.PI * 0.32;
  const endAngle = Math.PI * 0.32;

  const polarPoint = (dist: number, ang: number) => ({
    x: toX(Math.sin(ang) * dist),
    y: toY(0.1 + Math.cos(ang) * dist),
  });

  const minP1 = polarPoint(minD, startAngle);
  const minP2 = polarPoint(minD, endAngle);
  const maxP1 = polarPoint(maxD, startAngle);
  const maxP2 = polarPoint(maxD, endAngle);
  const viewingPath =
    maxD > minD
      ? `M ${minP1.x} ${minP1.y} L ${maxP1.x} ${maxP1.y} A ${maxD} ${maxD} 0 0 0 ${maxP2.x} ${maxP2.y} L ${minP2.x} ${minP2.y} A ${minD} ${minD} 0 0 1 ${minP1.x} ${minP1.y} Z`
      : '';

  return (
    <div className="w-full h-full bg-[#f8fafc] flex items-center justify-center p-4 overflow-hidden">
      <svg
        viewBox={`0 0 ${vbW} ${vbH}`}
        className="w-full h-full max-h-full"
        role="img"
        aria-label={`2D architectural floorplan of ${formatDim(state.roomWidthM, unit)} by ${formatDim(
          state.roomLengthM,
          unit
        )} conference room`}
      >
        <defs>
          <pattern id="cadGrid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
            <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="#e2e8f0" strokeWidth="0.02" />
          </pattern>
          <clipPath id="roomClip">
            <rect x={roomLeft} y={roomTop} width={roomW} height={roomH} />
          </clipPath>
        </defs>

        {/* CAD Floor Fill & 0.5m Grid */}
        <rect x={roomLeft} y={roomTop} width={roomW} height={roomH} fill="#ffffff" />
        <rect x={roomLeft} y={roomTop} width={roomW} height={roomH} fill="url(#cadGrid)" />

        {/* Clipped Interior Engineering Overlays */}
        <g clipPath="url(#roomClip)">
          {/* AVIXA Viewing Corridor */}
          {overlays.showViewingZone && viewingPath && (
            <path
              d={viewingPath}
              fill="rgba(99, 102, 241, 0.10)"
              stroke="rgba(99, 102, 241, 0.45)"
              strokeWidth="0.025"
              strokeDasharray="0.08 0.06"
            />
          )}

          {/* Camera FOV Cone */}
          {overlays.showCameraFov && (
            <polygon
              points={`${toX(0)},${toY(0.16)} ${toX(-halfSpread)},${toY(0.16 + fovReach)} ${toX(
                halfSpread
              )},${toY(0.16 + fovReach)}`}
              fill="rgba(0, 180, 216, 0.14)"
              stroke="#0284c7"
              strokeWidth="0.03"
            />
          )}

          {/* Acoustic Mic Pickup Circles */}
          {overlays.showMicZones &&
            report.micNodes.map((mn) => (
              <g key={mn.id}>
                <circle
                  cx={toX(mn.x)}
                  cy={toY(mn.z)}
                  r={mn.radiusM}
                  fill="rgba(16, 185, 129, 0.09)"
                  stroke="#059669"
                  strokeWidth="0.028"
                  strokeDasharray="0.1 0.06"
                />
              </g>
            ))}
        </g>

        {/* Outer Architectural Walls */}
        <rect
          x={roomLeft}
          y={roomTop}
          width={roomW}
          height={roomH}
          fill="none"
          stroke="#1a2b4c"
          strokeWidth="0.1"
        />

        {/* Display Wall Screens */}
        {state.displayMode === 'dual' ? (
          <>
            <rect
              x={toX(-report.displayWidthM / 2)}
              y={toY(0.05)}
              width={(report.displayWidthM - 0.06) / 2}
              height="0.08"
              fill="#00b4d8"
            />
            <rect
              x={toX(0.03)}
              y={toY(0.05)}
              width={(report.displayWidthM - 0.06) / 2}
              height="0.08"
              fill="#00b4d8"
            />
          </>
        ) : (
          <rect
            x={toX(-report.displayWidthM / 2)}
            y={toY(0.05)}
            width={report.displayWidthM}
            height="0.09"
            fill={state.displayMode === 'smd-wall' ? '#f26522' : '#00b4d8'}
          />
        )}

        {/* Conference Bar / Camera Icon */}
        <rect x={toX(-0.36)} y={toY(0.14)} width="0.72" height="0.1" rx="0.03" fill="#0f172a" />
        <circle cx={toX(0)} cy={toY(0.19)} r="0.035" fill="#00b4d8" />

        {/* Conference Table Shape */}
        {state.tableShape === 'oval' ? (
          <ellipse
            cx={toX(0)}
            cy={toY(tMidZ)}
            rx={state.tableWidthM / 2}
            ry={state.tableLengthM / 2}
            fill={TABLE_FILL[state.tableFinish]}
            stroke="#334155"
            strokeWidth="0.03"
          />
        ) : state.tableShape === 'boat' ? (
          <path
            d={`M ${toX(-state.tableWidthM * 0.36)} ${toY(tStart)} Q ${toX(0)} ${toY(
              tStart - 0.08
            )} ${toX(state.tableWidthM * 0.36)} ${toY(tStart)} Q ${toX(state.tableWidthM * 0.54)} ${toY(
              tMidZ
            )} ${toX(state.tableWidthM * 0.36)} ${toY(tStart + state.tableLengthM)} Q ${toX(0)} ${toY(
              tStart + state.tableLengthM + 0.08
            )} ${toX(-state.tableWidthM * 0.36)} ${toY(tStart + state.tableLengthM)} Q ${toX(
              -state.tableWidthM * 0.54
            )} ${toY(tMidZ)} ${toX(-state.tableWidthM * 0.36)} ${toY(tStart)} Z`}
            fill={TABLE_FILL[state.tableFinish]}
            stroke="#334155"
            strokeWidth="0.03"
          />
        ) : state.tableShape === 'u-shape' ? (
          (() => {
            const hw = state.tableWidthM / 2;
            const armT = Math.min(0.85, state.tableWidthM * 0.26);
            const bridgeT = Math.min(0.9, state.tableLengthM * 0.24);
            const zEnd = tStart + state.tableLengthM;
            return (
              <path
                d={`M ${toX(-hw)} ${toY(tStart)} L ${toX(-hw + armT)} ${toY(tStart)} L ${toX(
                  -hw + armT
                )} ${toY(zEnd - bridgeT)} L ${toX(hw - armT)} ${toY(zEnd - bridgeT)} L ${toX(
                  hw - armT
                )} ${toY(tStart)} L ${toX(hw)} ${toY(tStart)} L ${toX(hw)} ${toY(zEnd)} L ${toX(
                  -hw
                )} ${toY(zEnd)} Z`}
                fill={TABLE_FILL[state.tableFinish]}
                stroke="#334155"
                strokeWidth="0.03"
              />
            );
          })()
        ) : state.tableShape === 'classroom' ? (
          (() => {
            const rowCount = state.seats >= 18 ? 3 : state.seats >= 8 ? 2 : 1;
            const rowSpacing = Math.max(1.25, state.tableLengthM / Math.max(rowCount, 1));
            const deskW = Math.max(1.8, state.tableWidthM - 0.3);
            return Array.from({ length: rowCount }).map((_, r) => (
              <rect
                key={r}
                x={toX(-deskW / 2)}
                y={toY(tStart + r * rowSpacing - 0.16)}
                width={deskW}
                height="0.62"
                rx="0.05"
                fill={TABLE_FILL[state.tableFinish]}
                stroke="#334155"
                strokeWidth="0.025"
              />
            ));
          })()
        ) : (
          <rect
            x={toX(-state.tableWidthM / 2)}
            y={toY(tStart)}
            width={state.tableWidthM}
            height={state.tableLengthM}
            rx="0.12"
            fill={TABLE_FILL[state.tableFinish]}
            stroke="#334155"
            strokeWidth="0.03"
          />
        )}

        {/* Placed Expansion Mic Pods & Ceiling Array */}
        {report.micNodes
          .filter((m) => m.type !== 'bar')
          .map((mn) => (
            <g key={mn.id}>
              {mn.type === 'table-pod' ? (
                <circle
                  cx={toX(mn.x)}
                  cy={toY(mn.z)}
                  r="0.08"
                  fill="#0f172a"
                  stroke="#00b4d8"
                  strokeWidth="0.025"
                />
              ) : (
                <rect
                  x={toX(mn.x) - 0.25}
                  y={toY(mn.z) - 0.25}
                  width="0.5"
                  height="0.5"
                  fill="none"
                  stroke="#059669"
                  strokeWidth="0.03"
                  strokeDasharray="0.06 0.04"
                />
              )}
            </g>
          ))}

        {/* Seats with FOV/Mic Coverage Ring */}
        {report.seatPoints.map((s) => {
          const fillCol = !overlays.showSeatStatus
            ? '#334155'
            : s.status === 'optimal'
            ? '#10b981'
            : s.status === 'edge'
            ? '#f59e0b'
            : '#ef4444';
          return (
            <g key={s.index} transform={`translate(${toX(s.x)}, ${toY(s.z)})`}>
              <circle r="0.24" fill={fillCol} fillOpacity="0.22" stroke={fillCol} strokeWidth="0.025" />
              <circle r="0.13" fill="#1a2b4c" />
              <text
                y="0.045"
                textAnchor="middle"
                fontSize="0.12"
                fontWeight="700"
                fill="#ffffff"
              >
                {s.index}
              </text>
            </g>
          );
        })}

        {/* Architectural CAD Dimension Callouts */}
        {/* Top Width Callout */}
        <line
          x1={roomLeft}
          y1={roomTop - 0.35}
          x2={roomLeft + roomW}
          y2={roomTop - 0.35}
          stroke="#475569"
          strokeWidth="0.02"
        />
        <line x1={roomLeft} y1={roomTop - 0.48} x2={roomLeft} y2={roomTop - 0.22} stroke="#475569" strokeWidth="0.02" />
        <line
          x1={roomLeft + roomW}
          y1={roomTop - 0.48}
          x2={roomLeft + roomW}
          y2={roomTop - 0.22}
          stroke="#475569"
          strokeWidth="0.02"
        />
        <text
          x={roomLeft + roomW / 2}
          y={roomTop - 0.48}
          textAnchor="middle"
          fontSize="0.22"
          fontWeight="700"
          fill="#1a2b4c"
        >
          Room Width: {formatDim(state.roomWidthM, unit)}
        </text>

        {/* Left Length Callout */}
        <line
          x1={roomLeft - 0.35}
          y1={roomTop}
          x2={roomLeft - 0.35}
          y2={roomTop + roomH}
          stroke="#475569"
          strokeWidth="0.02"
        />
        <text
          x={roomLeft - 0.48}
          y={roomTop + roomH / 2}
          textAnchor="middle"
          fontSize="0.22"
          fontWeight="700"
          fill="#1a2b4c"
          transform={`rotate(-90 ${roomLeft - 0.48} ${roomTop + roomH / 2})`}
        >
          Room Depth: {formatDim(state.roomLengthM, unit)}
        </text>

        {/* Front Display Clearance Line */}
        <line
          x1={toX(0)}
          y1={toY(0.15)}
          x2={toX(0)}
          y2={toY(tStart)}
          stroke="#0284c7"
          strokeWidth="0.02"
          strokeDasharray="0.05 0.05"
        />
        <text
          x={toX(0.14)}
          y={toY(tStart * 0.55)}
          fontSize="0.16"
          fontWeight="700"
          fill="#0284c7"
        >
          {formatDim(report.frontClearanceM, unit)}
        </text>
      </svg>
    </div>
  );
};
