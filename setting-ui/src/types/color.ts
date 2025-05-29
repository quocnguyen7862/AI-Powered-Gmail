import { ColorPickerProps, GetProp } from "antd";

export type Color = GetProp<ColorPickerProps, "value">;
