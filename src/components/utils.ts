export function getQuarterlyReviewDates(annualAssessmentDate: number) {
  const date = new Date(annualAssessmentDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  // Calculate the dates for each quarter
  // Q1: 3 months after annual assessment
  // Q2: 6 months after annual assessment
  // Q3: 9 months after annual assessment
  // Q4: Last day of the month before annual assessment
  const q1 = new Date(year, month + 3, day);
  const q2 = new Date(year, month + 6, day);
  const q3 = new Date(year, month + 9, day);
  
  // For Q4, we need to handle the end of the month before the annual assessment
  const q4Month = month === 0 ? 11 : month - 1;
  const q4Year = month === 0 ? year - 1 : year;
  const lastDay = new Date(q4Year, q4Month + 1, 0).getDate(); // Get last day of the month
  const q4 = new Date(q4Year, q4Month, lastDay);

  return [
    { label: "1st Quarter", date: q1 },
    { label: "2nd Quarter", date: q2 },
    { label: "3rd Quarter", date: q3 },
    { label: "4th Quarter", date: q4 }
  ];
} 