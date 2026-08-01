export enum PanelSatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export enum ProjectStatus {
    DRAFT = 'DRAFT',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    ARCHIVED = 'ARCHIVED',
}

export enum FrameStatus {
    PENDING = 'PENDING',
    GENERATING = 'GENERATING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export enum BubbleType {
    SPEECH = 'SPEECH',
    THOUGHT = 'THOUGHT',
    NARRATION = 'NARRATION',
    SHOUT = 'SHOUT',
}

export enum JobType {
    SCRIPT_GENERATION = 'SCRIPT_GENERATION',
    IMAGE_GENERATION = 'IMAGE_GENERATION',
    LAYOUT_RENDERING = 'LAYOUT_RENDERING',
}

export enum JobStatus {
    QUEUED = 'QUEUED',
    RUNNING = 'RUNNING',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
    CANCELLED = 'CANCELLED',
}
