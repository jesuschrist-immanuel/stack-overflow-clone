import { questions, users } from "@/dummy/questions";
import {
  Proficiency,
  Question,
  Contributor,
  Project,
  RecordType,
  Coder,
} from "@/types";
import sortedIcons from "./icons";
import { Metadata } from "next";

export function varStatus() {
  return Math.random() > 0.5;
}

// export function parseDateString(dateString: string): Date {
//   const months: { [key: string]: number } = {
//     January: 0,
//     February: 1,
//     March: 2,
//     April: 3,
//     May: 4,
//     June: 5,
//     July: 6,
//     August: 7,
//     September: 8,
//     October: 9,
//     November: 10,
//     December: 11,
//   };

//   const dateParts = dateString.split(" ");
//   const month = months[dateParts[0]];
//   const day = parseInt(dateParts[1].replace(",", ""));
//   const year = parseInt(dateParts[2]);

//   return new Date(year, month, day);
// }

export function daysBetweenDateAndToday(dateString: string): string {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // Number of milliseconds in a day

  // Get the current date (today) and reset time to midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse the target date string into a Date object and reset time to midnight
  const targetDate = parseDateString(dateString);
  targetDate.setHours(0, 0, 0, 0);

  // Calculate the difference in time between the target date and today
  const timeDifference = targetDate.getTime() - today.getTime();

  // Calculate the number of days by dividing the time difference by the number of milliseconds in a day
  const daysDifference = Math.abs(
    Math.round(timeDifference / oneDayInMilliseconds)
  );

  // Check if the difference is greater than or equal to 365 days (1 year)
  if (daysDifference >= 365) {
    const years = Math.floor(daysDifference / 365);
    return years === 1 ? `${years} year` : `${years} years`;
  }

  // Check if the difference is greater than or equal to 30 days (1 month)
  if (daysDifference >= 30) {
    const months = Math.floor(daysDifference / 30);
    return months === 1 ? `${months} month` : `${months} months`;
  }

  // Return the number of days if less than 30 days
  return daysDifference !== 0 ? `${daysDifference} days` : "Today";
}

// Helper function to parse the date string
function parseDateString(dateString: string): Date {
  // Assumes the input dateString is in a format parseable by the Date constructor
  return new Date(dateString);
}

export function stringifyList(array: string[] | number[]): any {
  if (typeof array[0] === "string") {
    let listString = array[0];
    for (let i = 1; i < array.length; i++) {
      listString += `, ${array[i]}`;
    }
    return listString;
  } else {
    let listString = `${array[0]}`;
    for (let i = 1; i < array.length; i++) {
      listString += `, ${array[i]}`;
    }
    return listString;
  }
}

export const getTopLanguages = (languages: Proficiency[], rank: number) => {
  // Sort the codingLanguages array based on proficiency in descending order
  const sortedLanguages = languages.sort(
    (a, b) => b.proficiency - a.proficiency
  );

  // Take the first 3 elements (highest proficiency) from the sorted array
  return sortedLanguages.slice(0, rank);
};

// Function to sort questions and contributions based on users
// export const sortQuestionsAndContributions = (
//   questions: Question[],
//   users: User[]
// ) => {
//   const userMap: {
//     [userId: number]: {
//       name: string;
//       allQuestions: Question[];
//       askedQuestions: Question[];
//       contributedQuestions: Question[];
//       addedQuestionIds: Set<number>;
//     };
//   } = {};

//   // Initialize the user map with empty arrays for each user
//   users.forEach((user) => {
//     userMap[user.id] = {
//       name: user.name,
//       allQuestions: [],
//       askedQuestions: [],
//       contributedQuestions: [],
//       addedQuestionIds: new Set<number>(),
//     };
//   });

//   // Iterate through the questions and populate the user map
//   questions.forEach((question) => {
//     const askerId = question.asker.id;
//     if (!userMap[askerId].addedQuestionIds.has(question.id)) {
//       userMap[askerId].allQuestions.push(question);
//       userMap[askerId].askedQuestions.push(question);
//       userMap[askerId].addedQuestionIds.add(question.id);
//     }

//     question.contributors?.forEach((contributor) => {
//       const contributorId = contributor.user.id;
//       if (!userMap[contributorId].addedQuestionIds.has(question.id)) {
//         userMap[contributorId].allQuestions.push(question);
//         userMap[contributorId].contributedQuestions.push(question);
//         userMap[contributorId].addedQuestionIds.add(question.id);
//       } else {
//         userMap[contributorId].contributedQuestions.push(question);
//       }
//     });
//   });

//   for (const userId in userMap) {
//     userMap[userId].allQuestions.sort((a, b) => {
//       const aDateTime = new Date(a.date + " " + a.time).getTime();
//       const bDateTime = new Date(b.date + " " + b.time).getTime();
//       return bDateTime - aDateTime;
//     });

//     userMap[userId].askedQuestions.sort((a, b) => {
//       const aDateTime = new Date(a.date + " " + a.time).getTime();
//       const bDateTime = new Date(b.date + " " + b.time).getTime();
//       return bDateTime - aDateTime;
//     });

//     userMap[userId].contributedQuestions.sort((a, b) => {
//       const aDateTime = new Date(a.date + " " + a.time).getTime();
//       const bDateTime = new Date(b.date + " " + b.time).getTime();
//       return bDateTime - aDateTime;
//     });
//   }

//   return userMap;
// };

export const getTopQuestions = (questions: Question[], rank: number) => {
  return questions.slice(0, rank);
};

export const ellipsis = (text: string, maxChars: number): string => {
  if (text.length <= maxChars) {
    return text;
  } else {
    const trimmedText = text.substring(0, maxChars); // Trim the text to maxChars characters
    const lastSpaceIndex = trimmedText.lastIndexOf(" "); // Find the index of the last space
    const displayedText = trimmedText.substring(0, lastSpaceIndex); // Get the text until the last space
    const remainingText = text.substring(lastSpaceIndex); // Get the remaining text after the last space
    const lastWords = remainingText.split(" ").slice(-4).join(" "); // Get the last 4 words
    return `${displayedText} ... ${lastWords}`;
  }
};

export const combineText = (...texts: string[]): string => {
  return texts.join("\n\n");
};

// Function to convert date and time to a comparable format
export function convertToComparableDate(date: string, time: string) {
  const months: { [key: string]: number } = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  const [month, day, year] = date.split(" ");
  const [hour, minute] = time.split(":");

  const comparableDate = new Date(
    `${months[month]} ${day}, ${year} ${hour}:${minute}`
  );
  return comparableDate;
}

export const projectsMap = (projects: Project[], user: Coder) => {
  const userProjectsMap = new Map<number, Project[]>();

  for (const project of projects) {
    const userId = project.owner?.id;

    if (userId) {
      if (userProjectsMap.has(userId)) {
        userProjectsMap.get(userId)?.push(project);
      } else {
        userProjectsMap.set(userId, [project]);
      }
    }
  }

  return userProjectsMap.get(user.id);
};

export const randEl = <T>(items: T[]): T => {
  const randIndex = Math.floor(Math.random() * items.length);
  return items[randIndex];
};

export const uniqueArray = <T>(items: T[]) => {
  const set = new Set(items);
  const unique: T[] = Array.from(set);
  return unique;
};

export const labelValues = (
  array: string[]
): { label: string; value: string }[] => {
  return array.map((item) => ({
    label: item,
    value: item,
  }));
};

export const finalProfsByLangs = (data: Proficiency[]) => {
  const returnArray: { [key: string]: number } = {};
  for (const item of data) {
    if (item.proficiency > 0) {
      returnArray[item.language] = item.proficiency;
    }
  }
  return returnArray;
};

export const finalProficiencies = (data: { [key: string]: number }) => {
  const returnArray: Proficiency[] = [];
  const keys = Object.keys(data);

  for (let i = 0; i < keys.length; i++) {
    const newObject = {
      language: keys[i],
      proficiency: data[i],
    };
    returnArray.push(newObject);
  }

  return returnArray;
};

export const recordTypesFromLangs = () => {
  let records: RecordType[] = [];
  const allLangs = Object.keys(sortedIcons);
  for (let i = 0; i < allLangs.length; i++) {
    const data = {
      key: (i + 1).toString(),
      title: allLangs[i],
      description: allLangs[i],
      chosen: true,
    };
    records.push(data);
  }
  return records;
};

export async function generateMetadata(
  {
    params,
  }: {
    params: { id: string };
  },
  func: (id: string) => Question | undefined
): Promise<Metadata> {
  const question = func(params.id);

  return {
    title: question?.question,
    description: question?.description,
  };
}

// Function to format date and time
export const formatDateTime = (dateString: string) => {
  // Create a Date object from the input string
  const date = new Date(dateString);

  // Extract and format the date (MM/DD/YYYY)
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(date);

  // Extract and format the time (HH:MM AM/PM)
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  return { date: formattedDate, time: formattedTime };
};

export function formatEmbeddingInput(
  title: string,
  description: string,
  tags: string[]
): string {
  const output = `
  ${title}

  ${description}

  ${tags.join(", ")}
  `;

  return output;
}

// Function to calculate dot product of two vectors
function dotProduct(vectorA: number[], vectorB: number[]) {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must be of the same length");
  }
  return vectorA.reduce((sum, value, index) => sum + value * vectorB[index], 0);
}

// Function to calculate the magnitude of a vector
function magnitude(vector: number[]) {
  return Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
}

// Function to calculate cosine similarity
export function cosineSimilarity(vectorA: number[], vectorB: number[]) {
  const dotProd = dotProduct(vectorA, vectorB);
  const magnitudeA = magnitude(vectorA);
  const magnitudeB = magnitude(vectorB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    throw new Error(
      "Magnitude of a vector is zero, cannot compute cosine similarity"
    );
  }

  return dotProd / (magnitudeA * magnitudeB);
}
