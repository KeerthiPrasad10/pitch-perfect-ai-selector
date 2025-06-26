
// IFS Version and Module Type Definitions
export interface IFSVersionInfo {
  baseVersion: string; // Cloud or Remote
  releaseVersion: string;
  deploymentType: 'Cloud' | 'Remote';
  supportedMLCapabilities: string[];
}

export interface IFSCoreModule {
  moduleCode: string;
  moduleName: string;
  description: string;
  minVersion: string;
  mlCapabilities: string[];
  primaryIndustry?: string;
  releaseVersion?: string;
  baseIfsVersion?: string; // Cloud or Remote
}
