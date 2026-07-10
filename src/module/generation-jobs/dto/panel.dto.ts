import { PanelSatus } from "src/common/constants";

export class PanelDto {
    index: number;
    captionVi: string;
    imageUrl: string;
    promptEn: string;
    seed: number;
    status: PanelSatus;
    errorMessage?: string; // error_message
}