require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Problem = require("../models/Problem");
const connectDB = require("../config/db");

const codeforcesProblems = [
  {
    problemId: "CF-4A",
    title: "Watermelon",
    difficulty: "Easy",
    tags: ["math", "brute-force"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.\n\nPete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs even number of kilos, at the same time it is not obligatory that the parts are equal. The boys are extremely tired and want to start their meal as soon as possible, that's why you should help them and find out, if they can divide the watermelon in the way they want. For sure, each of them should get a part of positive weight.",
    inputFormat: "The first (and the only) input line contains integer number w (1 ≤ w ≤ 100) — the weight of the watermelon bought by the boys.",
    outputFormat: "Print YES, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and NO in the opposite case.",
    constraints: "1 ≤ w ≤ 100",
    examples: [
      { input: "8", output: "YES", explanation: "For example, Pete and Billy can divide the watermelon into two parts of 2 and 6 kilos respectively (both are even)." },
      { input: "2", output: "NO", explanation: "The only division is 1 and 1, which are odd numbers." },
      { input: "3", output: "NO", explanation: "An odd number cannot be divided into two even positive integers." }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-71A",
    title: "Way Too Long Words",
    difficulty: "Easy",
    tags: ["strings"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "Sometimes some words like \"localization\" or \"internationalization\" are so long that writing them many times in one text is quite tiresome.\n\nLet's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation.\n\nThis abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letters. That number is in decimal system and doesn't contain any leading zeroes.\n\nThus, \"localization\" will be spelt as \"l10n\", and \"internationalization\" will be spelt as \"i18n\".\n\nYou are suggested to automatize the process of changing the words with abbreviations. All too long words should be replaced by the abbreviation and the words that are not too long should not undergo any changes.",
    inputFormat: "The first line contains an integer n (1 ≤ n ≤ 100). Each of the following n lines contains one word. All words consist of lowercase Latin letters and share the length from 1 to 100 characters.",
    outputFormat: "Print n lines. The i-th line should contain the result of replacing of the i-th word from the input data.",
    constraints: "1 ≤ n ≤ 100, length of words 1 to 100.",
    examples: [
      { input: "4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis", output: "word\nl10n\ni18n\np43s" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-231A",
    title: "Team",
    difficulty: "Easy",
    tags: ["brute-force", "greedy"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "One day three best friends Petya, Vasya and Tonya decided to form a team and take part in programming contests. Participants are usually offered several problems during a programming contest. Friends decided that they will implement a problem if at least two of them are sure about the solution. Otherwise, the friends won't write the problem's solution.\n\nThis contest offers n problems to the participants. For each problem we know, which friend is sure about the solution. Help the friends find the number of problems for which they will write a solution.",
    inputFormat: "The first input line contains a single integer n (1 ≤ n ≤ 1000) — the number of problems in the contest. Then n lines contain three integers each, each integer is either 0 or 1. If the first number in the line equals 1, then Petya is sure about the problem's solution, otherwise he isn't sure. The second number shows Vasya's view on the solution, the third number shows Tonya's view.",
    outputFormat: "Print a single integer — the number of problems the friends will implement on the contest.",
    constraints: "1 ≤ n ≤ 1000",
    examples: [
      { input: "3\n1 1 0\n1 1 1\n1 0 0", output: "2" },
      { input: "2\n1 0 0\n0 1 1", output: "1" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-158A",
    title: "Next Round",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 3,
    memoryLimit: 256,
    problemStatement: "Contestant who earns a score equal to or greater than the k-th place finisher's score will advance to the next round, as long as the contestant earns a positive score.\n\nA total of n participants took part in the contest (n ≥ k), and you already know their scores. Calculate how many participants will advance to the next round.",
    inputFormat: "The first line of the input contains two integers n and k (1 ≤ k ≤ n ≤ 50) separated by a space.\n\nThe second line contains n space-separated integers a1, a2, ..., an (0 ≤ ai ≤ 100), where ai is the score earned by the participant who got the i-th place. The given sequence is non-increasing (that is, for all i from 1 to n - 1 the following condition is fulfilled: ai ≥ ai+1).",
    outputFormat: "Output the number of participants who advance to the next round.",
    constraints: "1 ≤ k ≤ n ≤ 50, 0 ≤ ai ≤ 100",
    examples: [
      { input: "8 5\n10 9 8 7 7 7 5 5", output: "6" },
      { input: "4 2\n0 0 0 0", output: "0" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-282A",
    title: "Bit++",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "The classic programming language Bit++ has only one variable, called x. Also, this variable is initially equal to 0.\n\nThere is only one character stream in Bit++, which is a sequence of n statements. Every statement consists of exactly one operation and one variable. An operation is either addition (++) or subtraction (--). The variable is X.\n\nA program in Bit++ is a sequence of statements. The program starts executing from the first statement and runs sequentially. The result of the program execution is the final value of the variable x.\n\nYou are given a program in Bit++. Please find the final value of x after program execution.",
    inputFormat: "The first line contains a single integer n (1 ≤ n ≤ 150) — the number of statements in the program. Next n lines contain statement each. Each statement contains exactly one operation and variable X.",
    outputFormat: "Print the single integer — the final value of X.",
    constraints: "1 ≤ n ≤ 150",
    examples: [
      { input: "2\nX++\n--X", output: "0" },
      { input: "1\n++X", output: "1" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-50A",
    title: "Domino piling",
    difficulty: "Easy",
    tags: ["greedy", "math"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "You are given a rectangular board of M × N squares. You are also given an unlimited number of standard domino pieces of 2 × 1 squares. More precisely, each piece can be rotated. You want to place as many dominoes as possible on the board so that the following conditions are satisfied:\n\n1. Each domino completely covers two squares.\n2. No two dominoes overlap.\n3. Each domino lies entirely inside the board. It is allowed to touch the edges of the board.\n\nFind the maximum number of dominoes, which can be placed under these restrictions.",
    inputFormat: "The input contains two integers M and N (1 ≤ M ≤ N ≤ 16).",
    outputFormat: "Output the maximum number of dominoes that can be placed.",
    constraints: "1 ≤ M ≤ N ≤ 16",
    examples: [
      { input: "2 4", output: "4" },
      { input: "3 3", output: "4" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-263A",
    title: "Beautiful Matrix",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "You've got a 5 x 5 matrix, consisting of 24 zeroes and a single number one. Let's index the matrix rows by numbers from 1 to 5 from top to bottom, let's index the matrix columns by numbers from 1 to 5 from left to right. In one move, you are allowed to apply one of the two following transformations: swap two neighboring matrix rows or swap two neighboring matrix columns.\n\nFind the minimum number of moves needed to make the single number one in the center of the matrix (at row 3, column 3).",
    inputFormat: "The input consists of 5 lines, each line contains 5 integers. All matrix integers are zeroes except for a single one.",
    outputFormat: "Output the minimum moves required.",
    constraints: "Matrix is 5x5 containing 24 zeroes and 1 one.",
    examples: [
      { input: "0 0 0 0 0\n0 0 0 0 1\n0 0 0 0 0\n0 0 0 0 0\n0 0 0 0 0", output: "3" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-112A",
    title: "Petya and Strings",
    difficulty: "Easy",
    tags: ["strings"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "Little Petya loves presents. Recently his mum bought two strings of equal length for him. Petya wants to compare these strings lexicographically. The letters' case does not matter, that is an uppercase letter is considered equivalent to the corresponding lowercase letter.\n\nHelp Petya perform the comparison. Return 0 if they are equal, -1 if the first is less than the second, and 1 if the first is greater.",
    inputFormat: "Each of the first two lines contains a string. The strings' lengths range from 1 to 100 inclusive. It is guaranteed that the strings are of the same length and consist of uppercase and lowercase Latin letters.",
    outputFormat: "If the first string is less than the second one, print -1. If the second string is less than the first one, print 1. If the strings are equal, print 0.",
    constraints: "Length 1 to 100",
    examples: [
      { input: "aaaa\naaaa", output: "0" },
      { input: "abs\nAbz", output: "-1" },
      { input: "abcdefg\nAbCdEfF", output: "1" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-339A",
    title: "Helpful Maths",
    difficulty: "Easy",
    tags: ["greedy", "strings"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "Xenia the beginner mathematician is learning to add numbers. She is given a string of numbers 1, 2, 3 separated by \"+\". Rearrange them in non-decreasing order.",
    inputFormat: "The input contains a non-empty string s representing the sum. It consists of digits 1, 2, and 3 and \"+\" characters.",
    outputFormat: "Print the rearranged sum.",
    constraints: "Length of string is at most 100.",
    examples: [
      { input: "3+2+1", output: "1+2+3" },
      { input: "1+1+3+1+3", output: "1+1+1+3+3" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-281A",
    title: "Word Capitalization",
    difficulty: "Easy",
    tags: ["strings"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "Capitalize the first letter of a given word.",
    inputFormat: "A single line containing a word of lowercase or uppercase Latin letters.",
    outputFormat: "Output the word with capitalized first letter.",
    constraints: "Length of word is at most 1000.",
    examples: [
      { input: "apple", output: "Apple" },
      { input: "Konjac", output: "Konjac" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-236A",
    title: "Boy or Girl",
    difficulty: "Easy",
    tags: ["strings"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "Determine gender based on number of distinct characters in username. If distinct characters is odd, male (\"IGNORE HIM!\"), if even, female (\"CHAT WITH HER!\").",
    inputFormat: "A single line containing a non-empty string of lowercase Latin letters.",
    outputFormat: "Print CHAT WITH HER! or IGNORE HIM!",
    constraints: "Length of string is at most 100.",
    examples: [
      { input: "wjmzbmr", output: "CHAT WITH HER!" },
      { input: "xiaodao", output: "IGNORE HIM!" },
      { input: "sevenkplus", output: "CHAT WITH HER!" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-546A",
    title: "Soldier and Bananas",
    difficulty: "Easy",
    tags: ["brute-force", "math"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "A soldier wants to buy w bananas in the shop. He has to pay k dollars for the first banana, 2k dollars for the second one and so on (in other words, he has to pay i·k dollars for the i-th banana).\n\nHe has n dollars. How many dollars does he have to borrow from his friend soldier to buy w bananas?",
    inputFormat: "Three space-separated integers k, n, w (1 ≤ k, w ≤ 1000, 0 ≤ n ≤ 10^9) — the cost of the first banana, initial number of dollars the soldier has and number of bananas he wants.",
    outputFormat: "Output the amount of money to borrow (0 if no borrow needed).",
    constraints: "1 ≤ k, w ≤ 1000, 0 ≤ n ≤ 10^9",
    examples: [
      { input: "3 17 4", output: "13" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-791A",
    title: "Bear and Big Brother",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "Bear Limak wants to become the largest of bears, or at least to become larger than his brother Bob.\n\nRight now, Limak weighs a and Bob weighs b. It is guaranteed that Limak's weight is smaller than or equal to Bob's weight.\n\nLimak eats a lot and his weight is tripled after every year, while Bob's weight is doubled after every year.\n\nAfter how many full years will Limak become strictly larger (strictly heavier) than Bob?",
    inputFormat: "The only line of the input contains two integers a and b (1 ≤ a ≤ b ≤ 10) — the weight of Limak and the weight of Bob respectively.",
    outputFormat: "Output one integer — the minimum number of years after which Limak will become strictly larger than Bob.",
    constraints: "1 ≤ a ≤ b ≤ 10",
    examples: [
      { input: "4 7", output: "2" },
      { input: "4 9", output: "3" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-617A",
    title: "Elephant",
    difficulty: "Easy",
    tags: ["math"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "An elephant decides to visit his friend. It turned out that the elephant's house is located at point 0 and his friend's house is located at point x (x > 0) of the coordinate line.\n\nIn one step the elephant can move 1, 2, 3, 4 or 5 positions forward. Determine, what is the minimum number of steps he need to make in order to reach his friend's house.",
    inputFormat: "The first line of the input contains an integer x (1 ≤ x ≤ 1,000,000) — the coordinate of the friend's house.",
    outputFormat: "Print the minimum number of steps that elephant needs to make to get from point 0 to point x.",
    constraints: "1 ≤ x ≤ 10^6",
    examples: [
      { input: "5", output: "1" },
      { input: "12", output: "3" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-977A",
    title: "Wrong Subtraction",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "Little Girl Tanya is learning how to decrease a number by one, but she does it wrong with a number consisting of two or more digits. Tanya subtracts one from a number by the following algorithm:\n\n1. If the last digit of the number is non-zero, she decreases the number by one;\n2. If the last digit of the number is zero, she divides the number by 10 (i.e. removes the last digit).\n\nYou are given an integer number n. Tanya will subtract one from it k times. Your task is to print the result after all k subtractions.",
    inputFormat: "The first line of the input contains two integers n and k (2 ≤ n ≤ 10^9, 1 ≤ k ≤ 50) — the number Tanya will subtract from, and the number of subtractions.",
    outputFormat: "Print one integer number — the result of the k decrements.",
    constraints: "2 ≤ n ≤ 10^9, 1 ≤ k ≤ 50",
    examples: [
      { input: "512 4", output: "50" },
      { input: "1000000000 9", output: "1" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-59A",
    title: "Word",
    difficulty: "Easy",
    tags: ["strings"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "Vasya is very upset that many people on the Net mix uppercase and lowercase letters in one word. That's why he decided to invent an extension for his favorite browser that would change the letter's register in every word so that it either only consisted of lowercase letters or, vice versa, only of uppercase letters. At that as little as possible letters should be changed in the word. For example, the word HoUse must be replaced with house, and the word ViP — with VIP. If a word contains an equal number of uppercase and lowercase letters, you should replace all the letters with lowercase ones. For example, maTrix should be replaced by matrix. Your task is to use the given algorithm on the given word.",
    inputFormat: "The single line contains a word s. s consists of uppercase and lowercase Latin letters.",
    outputFormat: "Print the corrected word.",
    constraints: "Length of string is at most 100.",
    examples: [
      { input: "HoUse", output: "house" },
      { input: "ViP", output: "VIP" },
      { input: "maTrix", output: "matrix" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-266B",
    title: "Queue at the School",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "During the break the schoolchildren, boys and girls, formed a queue of n people in the school canteen. Initially the children stood in the order they entered the canteen. However, after a while the boys started feeling awkward for standing in front of the girls in the queue and they started letting the girls move forward each second.\n\nLet's describe the process more precisely. Let's say that the positions in the queue are sequentially numbered by integers from 1 to n, at that the first person in the queue has position 1 and the last person has position n. If at time t the i-th position is occupied by a boy and the (i + 1)-th position is occupied by a girl, then at time t + 1 the i-th position will be occupied by a girl and the (i + 1)-th position will be occupied by a boy. The time is given in seconds.\n\nYou've got the initial position of the children, at that the values of n and t are given. Write a program that will find the queue that will form after t seconds.",
    inputFormat: "The first line contains two integers n and t (1 ≤ n, t ≤ 50) — the number of children in the queue and the time in seconds respectively. The second line contains string s, which represents the queue (B = Boy, G = Girl).",
    outputFormat: "Print string s, which represents the queue after t seconds.",
    constraints: "1 ≤ n, t ≤ 50",
    examples: [
      { input: "5 1\nBGGBG", output: "GBGGB" },
      { input: "5 2\nBGGBG", output: "GGBGB" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-116A",
    title: "Tram",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 2,
    memoryLimit: 256,
    problemStatement: "Linear tram line has n stops, numbered from 1 to n in the order of tram's movement. At the i-th stop ai passengers exit the tram, while bi passengers enter it. The tram is empty before it arrives at the first stop; also, when the tram departs from the last stop, it becomes empty.\n\nYour task is to find the minimum possible capacity of the tram so that the number of passengers inside the tram at any time never exceeds this capacity. Note that at each stop all exiting passengers exit before any entering passenger enters the tram.",
    inputFormat: "The first line contains an integer n (2 ≤ n ≤ 1000) — the number of stops the tram makes. Each of the following n lines contains two integers ai and bi (0 ≤ ai, bi ≤ 1000) — the number of passengers that exit the tram at the i-th stop, and the number of passengers that enter the tram at the i-th stop.",
    outputFormat: "Print a single integer — the minimum possible capacity of the tram.",
    constraints: "2 ≤ n ≤ 1000, 0 ≤ ai, bi ≤ 1000",
    examples: [
      { input: "4\n0 3\n2 5\n4 2\n4 0", output: "6" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-677A",
    title: "Vanya and Fence",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "Vanya and his friends are walking along the fence of height h. The i-th friend has height ai. A friend can walk along the fence only if his height is less than or equal to h. If a friend's height is strictly greater than h, he can walk only if he bends down.\n\nWhen a friend bends down, he takes up twice as much width of the road as when he walks upright.\n\nYour task is to find the minimum width of the road occupied by all friends walking together, if the width of the road occupied by one friend walking upright is 1, and the width of the road occupied by one friend walking bent down is 2.",
    inputFormat: "The first line of the input contains two integers n and h (1 ≤ n ≤ 1000, 1 ≤ h ≤ 1000) — the number of friends and the height of the fence respectively. The second line contains n space-separated integers ai (1 ≤ ai ≤ 2h) — the height of the i-th friend.",
    outputFormat: "Print a single integer — the minimum width of the road occupied by all friends walking together.",
    constraints: "1 ≤ n ≤ 1000, 1 ≤ h ≤ 1000, heights 1 to 2h.",
    examples: [
      { input: "3 7\n4 5 14", output: "4" },
      { input: "6 1\n1 1 1 1 1 1", output: "6" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  },
  {
    problemId: "CF-734A",
    title: "Anton and Danik",
    difficulty: "Easy",
    tags: ["implementation"],
    timeLimit: 1,
    memoryLimit: 256,
    problemStatement: "Anton and Danik like to play chess. One day they played n games in a row.\n\nFor each game it is known who was the winner — Anton or Danik. None of the games ended with a tie.\n\nNow Anton and Danik want to know who won more games. Help them find out who the winner was.",
    inputFormat: "The first line contains an integer n (1 ≤ n ≤ 100000) — the number of games played. The second line contains a string s, consisting of uppercase English letters 'A' and 'D' — the outcomes of the games.",
    outputFormat: "If Anton won more games than Danik, print 'Anton'. If Danik won more games than Anton, print 'Danik'. If Anton and Danik won the same number of games, print 'Friendship'.",
    constraints: "1 ≤ n ≤ 100000",
    examples: [
      { input: "6\nADAAAA", output: "Anton" },
      { input: "7\nDDDAADA", output: "Danik" },
      { input: "6\nDADADA", output: "Friendship" }
    ],
    status: "Published",
    createdBy: "Codeforces"
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("[Seeder] Connected to DB.");

    // Delete existing CF problems to avoid duplicates
    const deleteResult = await Problem.deleteMany({ createdBy: "Codeforces" });
    console.log(`[Seeder] Deleted ${deleteResult.deletedCount} existing Codeforces problems.`);

    // Insert new CF problems
    const insertResult = await Problem.insertMany(codeforcesProblems);
    console.log(`[Seeder] Inserted ${insertResult.length} Codeforces problems.`);

    console.log("[Seeder] Completed successfully.");
  } catch (err) {
    console.error("[Seeder] Error seeding database:", err);
  } finally {
    mongoose.connection.close();
    console.log("[Seeder] DB Connection closed.");
  }
};

if (require.main === module) {
  seedDB();
}

module.exports = codeforcesProblems;
