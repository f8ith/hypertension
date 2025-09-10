export interface UserDataProps {
  ust: {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    id_token: string;
  };
}

export interface StdtEnrolResp {
  status: string;
  message: string;
  errorCode: string;
  totalRecord: number;
  offset: number;
  limit: number;
  stdtID: string;
  userName: string;
  showInstr: YesNo;
  stdtInfo: StdtInfoClassEnrl[];
}

export enum YesNo {
  N = "N",
  Y = "Y",
}

export interface StdtInfo {
  stdtID: string;
  acadCareer: string;
  stdtCareerNbr: number;
  schoolCode: string;
  deptCode: string;
  deptShortName: string;
  planCode: string;
  planName: string;
}

export interface StdtInfoCourseGrade extends StdtInfo {
  stdtCourseGrade: StdtCourseGrade[];
}

export interface StdtCourseGrade {
  crseTakenTerm: string;
  crseTakenTermName: string;
  crseCode: string;
  crseTitle: string;
  crseEnrlType: string;
  crseEnrlStatus: string;
  crseUnitTaken: number;
  crseUnitEarned: number;
  crseGrade: string;
  inclGPA: string;
  inclGGA: string;
}

export interface StdtInfoClassEnrl extends StdtInfo {
  studentClassEnrl: StudentClassEnrl[];
  studentClassWaitlist: StudentClassWaitlist[];
}

export interface StudentClassEnrl {
  termCode: string;
  termName: string;
  crseId: string;
  classNbr: number;
  crseCode: string;
  crseTitle: string;
  crseUnit: string;
  classSection: string;
  classTypeName: ClassTypeName;
  enrlComponent: YesNo;
  holidaySchedule: HolidaySchedule[];
  studentClassSchedule: StudentClassSchedule[];
  studentFinalExamSchedule: any[];
  studentCourseInstructor: StudentCourseInstructor[];
}


export interface StudentClassWaitlist {
  termCode: string
  crseId: string
  crseCode: string
  classSections: string[]
  classes: {
    classNbr: number
    classSection: string
  }[]
  waitPosition: number
}

export enum ClassTypeName {
  Laboratory = "Laboratory",
  Lecture = "Lecture",
  Tutorial = "Tutorial",
}

export interface HolidaySchedule {
  name: string;
  date: string;
}

export interface StudentClassSchedule {
  termCode: string;
  crseCode: string;
  classSection: string;
  classMtgNbr: number;
  facilityId: string;
  classRoom: string;
  classStartDate: string;
  classEndDate: string;
  classStartTime: string;
  classEndTime: string;
  mon: YesNo;
  tues: YesNo;
  wed: YesNo;
  thurs: YesNo;
  fri: YesNo;
  sat: YesNo;
  sun: YesNo;
}

export interface StudentCourseInstructor {
  termCode: string;
  crseCode: string;
  classSection: string;
  classMtgNbr: number;
  instrName: string;
  instrEmail: string;
}

export interface CourseInformation {
  acadYearFull: string;
  termCode: string;
  termName: string;
  campus: string;
  campusName: string;
  campusShortName: string;
  crseID: string;
  crsePrefix: string;
  catalogNbr: string;
  crseCode: string;
  careerType: string;
  acadCareer: string;
  schoolCode: string;
  deptCode: string;
  deptShortName: string;
  crseTitle: string;
  minUnits: string;
  maxUnits: string;
  crseVector: string;
  prnVector: string;
  crseDescr: string;
  prevCrseCode: string;
  altCrseCode: string;
  crsePrerequisite: string;
  crseCorequisite: string;
  crseExclusion: string;
  crseBackgd: string;
  crseColist: string;
  crseCrsCmpEqv: string;
  crseReference: string;
  courseAttribute: any[];
  ciloInformation: CiloInformation[];
}

export interface CiloInformation {
  crseID: string;
  termCode: string;
  ciloSeq: string;
  ciloDescription: string;
}

export interface ClassQuota {
  crseId: string;
  acadCareer: string;
  subject: string;
  catalogNbr: string;
  crseCode: string;
  crseDesc: string;
  longDesc: string;
  prevCrseCode: string;
  preReq: string;
  coReq: string;
  exclusion: string;
  credit: number;
  attributes: any[];
  classes: UstClass[];
}

export interface UstClass {
  section: string;
  classNbr: number;
  classType: string;
  componentType: string;
  associatedClass: number;
  remarks: string;
  enrlCap: number;
  enrlTot: number;
  waitTot: number;
  consent: boolean;
  classOpen: boolean;
  reserveCap: any[];
  schedules: ClassSchedule[];
}

export interface ClassSchedule {
  instructors: string[];
  facilityId: string;
  venue: string;
  startDt: string;
  endDt: string;
  weekdays: number[];
  startTime: string;
  endTime: string;
}

export interface TermInfo {
  term: string;
  termDesc: string;
}

export type TDaysInWeek = {
  mon: 0;
  tues: 1;
  wed: 2;
  thurs: 3;
  fri: 4;
  sat: 5;
  sun: 6;
};
