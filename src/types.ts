export interface ResultItem {
  field: string;
  text: string;
}

export interface PlanItem {
  field: string;
  title: string;
  content: string; // (주요내용)
  date: string;    // (일시)
  admin: string;   // (행정사항)
}

export interface MemberData {
  results: ResultItem[];
  plans: PlanItem[];
}

export interface Member {
  id: string;
  name: string;
  field: string;
}

export interface AppData {
  team: string;
  fields: string[];
  members: Member[];
  weeks: {
    [mondayKey: string]: {
      [memberId: string]: MemberData;
    };
  };
  opts: {
    showName: boolean;
  };
}
