import { useState, useEffect } from "react";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Button from "@mui/material/Button";
import HtmlTooltip from "./HtmlTooltip";

interface OverlayTableProps {
  data: any;
  onContextMenu?: (e: React.MouseEvent, item: any, type: "image" | "") => void;
  onChooseCell?: (cell: any, type: "open" | "close") => void;
}

export default function OverlayTable({ data, onChooseCell }: OverlayTableProps) {
  const [table, setTable] = useState<any>();
  const { height, width, left, top } = table || {};
  const [openTooltipIndex, setOpenTooltipIndex] = useState<{ row: number; cell: number } | null>(null);

  const handleTooltipClose = () => {
    setOpenTooltipIndex(null);
  };

  const handleChooseCell = (cell: any, type: "open" | "close") => {
    if (onChooseCell) onChooseCell(cell, type);
    setOpenTooltipIndex(null);
  };

  const handleCellClick = (e: React.MouseEvent<HTMLSpanElement>, cell: any) => {
    e.preventDefault();
    if (e.type === "contextmenu") {
      handleChooseCell(cell, "close");
    } else if (e.type === "click") {
      handleChooseCell(cell, "open");
    }
  };
  useEffect(() => {
    setTable(data?.tables[0]);
  }, [data]);

  return (
    <div className="absolute h-full w-full top-0 left-0 right-0 bottom-0" style={{ top: top, left: left, width: width, height: height }}>
      {table &&
        table.data.map((row: any, rowIndex: number) => (
          <div key={rowIndex} className="flex">
            {row.map((cell: any, cellIndex: number) => (
              <ClickAwayListener key={cellIndex} onClickAway={handleTooltipClose}>
                <HtmlTooltip
                  key={`${rowIndex}-${cellIndex}`}
                  PopperProps={{
                    disablePortal: true,
                  }}
                  open={openTooltipIndex?.row === rowIndex && openTooltipIndex?.cell === cellIndex}
                  onClose={handleTooltipClose}
                  disableFocusListener
                  disableHoverListener
                  disableTouchListener
                  title={
                    <div>
                      <Button variant="contained" color="primary" onClick={() => handleChooseCell(cell, "open")}>
                        Open
                      </Button>
                      <Button variant="contained" color="secondary" onClick={() => handleChooseCell(cell, "close")}>
                        Close
                      </Button>
                    </div>
                  }
                >
                  <span
                    className="hover:bg-black/50"
                    style={{
                      width: cell.width,
                      height: cell.height,
                    }}
                    onClick={(e) => handleCellClick(e, cell)}
                    onContextMenu={(e) => handleCellClick(e, cell)}
                  ></span>
                </HtmlTooltip>
              </ClickAwayListener>
            ))}
          </div>
        ))}
    </div>
  );
}
