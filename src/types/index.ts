import { Credentials } from "google-auth-library";

export interface UserDataProps {
  accessToken?: string;
  googleCredentials?: Credentials;
}

export interface StdtClassEnrol {
  status: string;
  message: string;
  errorCode: string;
  totalRecord: number;
  offset: number;
  limit: number;
  stdtID: string;
  userName: string;
  showInstr: YesNo;
  stdtInfo: StdtInfo[];
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
  studentClassEnrl: StudentClassEnrl[];
  studentClassWaitlist: any[];
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
