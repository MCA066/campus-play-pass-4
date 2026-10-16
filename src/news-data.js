// Fictional editorial examples only; no entry is live news or a current squad report.
const sampleNotice='This fictional CampusPlay sample is an evergreen sport explainer, not breaking news, a current match report, or a claim about current team selection.';
const story=(id,sport,title,summary,image,imageAlt,content)=>({id,sport,category:'Sample profile',title,summary,author:'CampusPlay Editorial · Sample',publishedAt:'2026-10-14',image,imageAlt,readTime:'3 min read',content:[...content,sampleNotice]});
export const sampleArticles = [
 story('virat-kohli','Cricket','Virat Kohli: a top-order batter’s place in the game','A short, factual profile of the Indian international cricketer and his batting role.','/images/players/cricket/virat-kohli.jpg','Portrait of Indian cricketer Virat Kohli.',[
  'Virat Kohli is an Indian international cricketer who plays as a top-order batter. A top-order batter takes a place near the beginning of a side’s batting order.',
  'This sample profile focuses on the role itself and does not describe a current fixture, form, statistics, or team selection.'
 ]),
 story('ms-dhoni','Cricket','MS Dhoni: the wicketkeeper-batter role','A sample explainer about the two responsibilities named in MS Dhoni’s cricket role.','/images/players/cricket/ms-dhoni.jpg','Portrait of Indian cricketer MS Dhoni.',[
  'MS Dhoni is an Indian cricketer whose playing role combines wicketkeeping and batting. A wicketkeeper takes the position behind the stumps while their side fields.',
  'The profile is about those cricket roles, not an update about a current team or match.'
 ]),
 story('ravindra-jadeja','Cricket','Ravindra Jadeja and the all-rounder role','A simple introduction to the all-rounder label used for this Indian international cricketer.','/images/players/cricket/ravindra-jadeja.jpg','Ravindra Jadeja during an interview.',[
  'Ravindra Jadeja is an Indian international cricketer described as an all-rounder, a role that contributes in more than one discipline of the game.',
  'This sample is a short role explainer and makes no claim about current performance or selection.'
 ]),
 story('dwayne-bravo','Cricket','Dwayne Bravo: understanding the all-rounder role','A brief cricket explainer illustrated with a portrait of Dwayne Bravo.','/images/players/cricket/dwayne-bravo.jpg','Portrait of cricketer Dwayne Bravo.',[
  'Dwayne Bravo is a cricketer known for an all-round role. The term describes a player who contributes both with bat and ball.',
  'This evergreen sample is not a current news report or a record of match statistics.'
 ]),
 story('chris-gayle','Cricket','Chris Gayle: the batter’s role','A factual sample profile introducing the Jamaican cricketer’s batting role.','/images/players/cricket/chris-gayle.jpg','Chris Gayle on the field during an international cricket match.',[
  'Chris Gayle is a Jamaican cricketer whose ICC profile lists his role as batter.',
  'This sample profile stays with that basic sports context and does not make claims about current competitions or statistics.'
 ]),
 story('india-men','Cricket','A look at India’s men’s national cricket team','A national-team photo and a simple guide to the team’s place in international cricket.','/images/teams/cricket/team-india.jpg','India men’s national cricket team players in blue cricket kit on the field.',[
  'India’s men’s national cricket team represents India in international cricket. The photograph shows the national side in blue on the field.',
  'The image is editorial and does not depict a CampusPlay team or a current squad announcement.'
 ]),
 story('new-zealand-men','Cricket','New Zealand’s men’s team in Test action','A match photograph of New Zealand batter Devon Conway during the third Test against England in 2026.','/images/teams/cricket/team-new-zealand.jpg','New Zealand batter Devon Conway during the third Test against England in 2026.',[
  'The Commons file caption identifies New Zealand batter Devon Conway during day one of the third Test against England in 2026. This dated match image is editorial and is not a current squad announcement.',
  'New Zealand’s national side is separate from Northbridge College teams and tournament entries.'
 ]),
 story('australia-men','Cricket','Australia’s men’s team in an 1893 portrait','A historic team photograph identified by its original source as the 1893 Australia national cricket team.','/images/teams/cricket/team-australia.jpg','Archival group portrait of the 1893 Australia national cricket team.',[
  'The photograph is identified by its source as the 1893 Australia national cricket team. The date is included so the archival image is not mistaken for a current lineup.',
  'This editorial example is about national cricket history and has no connection to CampusPlay college participants.'
 ]),
 story('lionel-messi','Football','Lionel Messi: the forward’s role','An evergreen football explainer illustrated with a photograph of Argentine forward Lionel Messi.','/images/players/football/lionel-messi.jpg','Lionel Messi during the 2022 FIFA World Cup.',[
  'Lionel Messi is an Argentine professional footballer who plays as a forward. Forwards take attacking positions and work to create scoring opportunities.',
  'This profile describes a position and is not a report on a current club, competition, or match.'
 ]),
 story('cristiano-ronaldo','Football','Cristiano Ronaldo: a forward in focus','A short role profile using a licensed editorial photograph of the Portuguese footballer.','/images/players/football/cristiano-ronaldo.jpg','Cristiano Ronaldo playing for Manchester United during the 2006–07 season.',[
  'Cristiano Ronaldo is a Portuguese professional footballer who plays as a forward.',
  'The photograph is an older editorial image. This fictional sample does not imply a current club affiliation or match appearance.'
 ]),
 story('sergio-ramos','Football','Sergio Ramos: the defender’s role','A basic introduction to the defender position, paired with a photo identified as Sergio Ramos in 2007.','/images/players/football/sergio-ramos.jpg','Sergio Ramos in 2007.',[
  'Sergio Ramos is a Spanish professional footballer who plays as a defender. Defenders work to protect their side’s goal and disrupt opposing attacks.',
  'This sample explains a playing position and does not make a claim about a current club or fixture.'
 ])
];

export function getArticleById(id) { return sampleArticles.find(article => article.id === id) || null; }
