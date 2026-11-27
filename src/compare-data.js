
const rss='https://www.rsssf.org/miscellaneous/century.html';
const awards='https://www.uefa.com/ballondor/news/0287-195e642735da-0594342b9554-1000--history-of-the-ball-on-d-or-all-the-winners/';
const acs='https://stats.acscricket.com/Records/ODI/Overall/Players/Most_Career_Runs.html';
const peakSource='https://en.wikipedia.org/wiki/List_of_chess_players_by_peak_FIDE_rating';
const fide='https://ratings.fide.com/';
const fideNov='https://wrchessnews.com/ratings';
const foot=(name,country,role,caps,goals,ballon,year,highlight,opts={})=>({name,country,role,wiki:opts.wiki||name,stats:{caps,goals,rate:caps&&goals!=null?+(goals/caps).toFixed(2):null,ballon},year,highlight,sources:[{name:'International record',url:opts.source||rss},{name:'Ballon d’Or history',url:awards}],local:opts.local});
const cricket=(name,country,role,stats,year,highlight,opts={})=>({name,country,role,wiki:opts.wiki||name,stats,year,highlight,sources:[{name:'Career statistics',url:opts.source||acs},...(opts.bowlingSource?[{name:'Bowling statistics',url:opts.bowlingSource}]:[])],local:opts.local});
const chess=(name,country,peak,year,highlight,stats={},wiki=name)=>({name,country,role:'Grandmaster',wiki,stats:{peak,...stats},year,highlight,sources:[{name:'Historical peak rating',url:peakSource},{name:'FIDE rating lists',url:fide},{name:'November 2026 snapshot',url:fideNov}]});
const bat=(matches,runs,avg,hundreds,fifties,high,extra={})=>({matches,runs,avg,hundreds,fifties,high,...extra});
export const players={
Football:[
foot('Lionel Messi','Argentina','Forward',207,125,8,'RSSSF 2026 snapshot','Eight Ballon d’Or awards',{local:'/images/players/football/lionel-messi.jpg'}),
foot('Cristiano Ronaldo','Portugal','Forward',233,146,5,'RSSSF 2026 snapshot','Five Ballon d’Or awards',{local:'/images/players/football/cristiano-ronaldo.jpg'}),
foot('Sergio Ramos','Spain','Defender',180,23,0,'International career through 2021','2010 World Cup winner',{source:'https://rfef.es/es/selecciones/jugadores/sergio-ramos',local:'/images/players/football/sergio-ramos.jpg'}),
foot('Neymar','Brazil','Forward',130,80,0,'RSSSF 2026 snapshot','Brazil international goalscorer'),
foot('Ángel Di María','Argentina','Winger',145,28,0,'International career through 2024','2022 World Cup winner',{source:'https://footballcountry.com/records'}),
foot('Ronaldinho','Brazil','Attacking midfielder',97,33,1,'International career through 2013','2005 Ballon d’Or winner'),
foot('Luis Suárez','Uruguay','Forward',143,69,0,'International career through 2024','2011 Copa América winner',{source:'https://www.rsssf.org/miscellaneous/bijtertje-intlg.html'}),
foot('Son Heung-min','South Korea','Forward',149,56,0,'RSSSF 2026 snapshot','2021–22 Premier League Golden Boot (joint)'),
foot('Sunil Chhetri','India','Forward',157,95,0,'RSSSF snapshot through 2025','India international goalscoring record'),
foot('Manuel Neuer','Germany','Goalkeeper',128,0,0,'DFB through June 2026','2014 World Cup winner',{source:'https://datencenter.dfb.de/en/teams/germany/record_players'}),
foot('Gianluigi Buffon','Italy','Goalkeeper',176,0,0,'International career through 2018','2006 World Cup winner'),
foot('Iker Casillas','Spain','Goalkeeper',167,0,0,'International career through 2016','2010 World Cup winner'),
foot('Alisson Becker','Brazil','Goalkeeper',83,0,0,'2026 World Cup squad-list snapshot','2019 Copa América winner',{wiki:'Alisson Becker',source:'https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf?gsid=28108c2b-581c-401b-b923-1d57c03f007a'}),
foot('Kylian Mbappé','France','Forward',106,66,0,'2026 snapshot','2018 World Cup winner',{source:'https://footballcountry.com/records'}),
foot('Kevin De Bruyne','Belgium','Midfielder',129,41,0,'Belgian FA snapshot, accessed Nov 2026','2022–23 UEFA Champions League winner',{source:'https://static.rbfa.be/project/publiek/jrinteren/speler_PH_5733.htm'}),
foot('Luka Modrić','Croatia','Midfielder',202,29,1,'2026 snapshot','2018 Ballon d’Or winner',{source:'https://footballcountry.com/records'}),
foot('Mohamed Salah','Egypt','Forward',121,68,0,'RSSSF 2026 snapshot','2018–19 UEFA Champions League winner'),
foot('Karim Benzema','France','Forward',97,37,1,'International career through 2022','2022 Ballon d’Or winner'),
foot('Robert Lewandowski','Poland','Forward',163,88,0,'RSSSF snapshot through 2025','2019–20 UEFA Champions League winner')
],
Cricket:[
cricket('MS Dhoni','India','Wicketkeeper-batter',bat(350,10773,50.57,10,73,183),'ODI career through 2019','2011 World Cup-winning captain',{local:'/images/players/cricket/ms-dhoni.jpg'}),
cricket('Virat Kohli','India','Batter',bat(314,14941,58.59,54,79,183),'ACS cached 2026 snapshot','2011 ODI World Cup winner',{local:'/images/players/cricket/virat-kohli.jpg'}),
cricket('Chris Gayle','West Indies','Batting all-rounder',bat(301,10480,37.83,25,54,215),'ODI career through 2019','Two-time T20 World Cup winner',{local:'/images/players/cricket/chris-gayle.jpg'}),
cricket('AB de Villiers','South Africa','Wicketkeeper-batter',bat(228,9577,53.50,25,53,176),'ODI career through 2018','Fastest men’s ODI century (31 balls)'),
cricket('Suryakumar Yadav','India','Batter',bat(37,773,25.77,0,4,72,{strike:105.03}),'ICC snapshot, accessed Nov 2026','2024 T20 World Cup winner',{source:'https://www.icc-cricket.com/rankings/11803/suryakumar-yadav'}),
cricket('Suresh Raina','India','Batter',bat(226,5615,35.31,5,36,116),'ODI career through 2018','2011 ODI World Cup winner'),
cricket('Dwayne Bravo','West Indies','All-rounder',bat(164,2968,25.36,2,10,112),'ODI career through 2014','Two-time T20 World Cup winner',{source:'https://www.windiescricket.com/players/dwayne-bravo-2172/',local:'/images/players/cricket/dwayne-bravo.jpg'}),
cricket('Ben Stokes','England','All-rounder',bat(114,3463,41.23,5,24,182,{strike:95.69,wickets:74,economy:6.05}),'ICC ODI snapshot, accessed Nov 2026','2019 ODI World Cup winner',{source:'https://www.icc-cricket.com/rankings/10130/ben-stokes',bowlingSource:'https://www.ipl.com/player/ben-stokes'}),
cricket('Glenn Maxwell','Australia','All-rounder',bat(149,3990,33.81,4,23,201,{strike:126.7,wickets:77,economy:5.46}),'ODI career through 2025','2015 and 2023 ODI World Cup winner',{source:'https://www.cricbuzz.com/cricket-news/134521/world-cup-heroics-highlight-glenn-maxwells-odi-journey'}),
cricket('Faf du Plessis','South Africa','Batter',bat(143,5507,47.47,12,35,185),'ODI career through 2019','Former South Africa captain'),
cricket('Rohit Sharma','India','Batter',bat(296,12150,48.60,35,63,264,{strike:93.27,fours:1151,sixes:383,catches:114,stumpings:0}),'ACS cached 2026 snapshot','Men’s ODI highest individual score: 264'),
cricket('Jasprit Bumrah','India','Bowler',bat(91,111,9.25,0,0,20,{strike:64.53,wickets:151,economy:4.58}),'BCCI / ICC 2026 snapshot','2024 T20 World Cup Player of the Tournament',{source:'https://bccitv-widget.epicon.in/players/9/jasprit-bumrah?platform=international&type=men',bowlingSource:'https://www.icc-cricket.com/rankings/63755/jasprit-bumrah'}),
cricket('Ravindra Jadeja','India','All-rounder',bat(210,2905,32.28,0,13,87,{strike:85.54,wickets:232,economy:4.89,fours:210,sixes:55,catches:80,stumpings:0}),'ACS cached 2026 snapshot','2024 T20 World Cup winner',{local:'/images/players/cricket/ravindra-jadeja.jpg'}),
cricket('Hardik Pandya','India','All-rounder',bat(94,1904,32.83,0,11,92,{strike:110.89,wickets:91,economy:5.6}),'BCCI 2026 snapshot','2024 T20 World Cup winner',{source:'https://scores-bcci.epicon.in/international/men/players/hardik-pandya/54',bowlingSource:'https://www.sportlyradar.com/cricket/players/9647/hardik-pandya'}),
cricket('Andre Russell','West Indies','All-rounder',bat(56,1034,27.21,0,4,92,{strike:130.22}),'ODI career through 2019','Two-time T20 World Cup winner',{source:'https://www.windiescricket.com/players/andre-russell-4400/'}),
cricket('Jos Buttler','England','Wicketkeeper-batter',bat(202,5578,39,11,29,162),'ACS cached 2026 snapshot','2022 T20 World Cup-winning captain'),
cricket('Kane Williamson','New Zealand','Batter',bat(175,7256,48.69,15,47,148),'ACS snapshot, accessed Nov 2026','2019 ODI World Cup Player of the Tournament'),
cricket('David Warner','Australia','Batter',bat(161,6932,45.30,22,33,179),'ODI career through 2023','2015 and 2023 ODI World Cup winner',{wiki:'David Warner (cricketer)'})
],
Chess:[
chess('Gukesh','India',2794,'Oct 2024','2024 World Chess Champion',{standard:2710,rapid:2686,blitz:2659},'Gukesh Dommaraju'),
chess('Praggnanandhaa','India',2785,'Sep 2025','2023 FIDE World Cup finalist',{standard:2763,rapid:2733,blitz:2712},'R Praggnanandhaa'),
chess('Javokhir Sindarov','Uzbekistan',2782,'Oct 2026','2022 Chess Olympiad team gold',{standard:2782,rapid:2755,blitz:2725}),
chess('Mikhail Tal','Soviet Union / Latvia',2705,'Jan 1980','1960 World Chess Champion'),
chess('Garry Kasparov','Soviet Union / Russia',2851,'Jul 1999','World Chess Champion from 1985'),
chess('Bobby Fischer','United States',2785,'Jul 1972','1972 World Chess Champion'),
chess('Magnus Carlsen','Norway',2882,'May 2014','Five classical world championship match victories',{standard:2823,rapid:2801,blitz:2860}),
chess('Viswanathan Anand','India',2817,'Mar 2011','Five-time world champion across championship formats'),
chess('Arjun Erigaisi','India',2801,'Dec 2024','Passed 2800 on the FIDE classical list',{standard:2746,rapid:2740,blitz:2766},'Arjun Erigaisi'),
chess('Hikaru Nakamura','United States',2816,'Oct 2015','Five-time US Chess Champion',{standard:2792,rapid:2718,blitz:2800}),
chess('Fabiano Caruana','United States',2844,'Oct 2014','2018 World Championship challenger',{standard:2783,rapid:2687,blitz:2738}),
chess('Ding Liren','China',2816,'Nov 2018','2023 World Chess Champion',{standard:2723,rapid:2689,blitz:2736}),
chess('Ian Nepomniachtchi','Russia',2795,'Mar 2023','Two consecutive Candidates Tournament wins',{standard:2719,rapid:2748,blitz:2765}),
chess('Vladimir Kramnik','Russia',2817,'Oct 2016','2000 World Chess Champion'),
chess('Anatoly Karpov','Soviet Union / Russia',2780,'Jul 1994','World Chess Champion from 1975')
]};
export const metricSets={Football:[['caps','Senior international caps'],['goals','Senior international goals'],['rate','Goals per international match'],['ballon','Ballon d’Or awards']],Cricket:[['matches','ODI matches'],['runs','ODI runs'],['avg','Batting average'],['strike','Batting strike rate'],['hundreds','Centuries'],['fifties','Fifties'],['high','Highest ODI score (runs)'],['wickets','ODI wickets'],['economy','Bowling economy']],Chess:[['peak','Peak published classical Elo'],['standard','Classical Elo · Nov 2026'],['rapid','Rapid Elo · Nov 2026'],['blitz','Blitz Elo · Nov 2026']]};

const uclSources=[
{name:'UEFA goals (competition proper)',url:'https://www.uefa.com/uefachampionsleague/news/0257-0e910cf2494a-5185150de9d4-1000--champions-league-all-time-/'},
{name:'UEFA appearances',url:'https://www.uefa.com/uefachampionsleague/news/025a-0e9f8a3d1e40-d534e8b4a897-1000--champions-league-appearances/'},
{name:'UEFA assists (March 2025)',url:'https://www.uefa.com/uefachampionsleague/news/0297-1d3e8b524832-5bf371ab86ce-1000--most-assists-in-the-champions-league-cristiano-ronaldo-leads-the-way/'},
{name:'UEFA goalkeeper records',url:'https://www.uefa.com/uefachampionsleague/news/0253-0e99cb9576d8-81e0528b33a7-1000--champions-league-s-top-goalkeepers-casillas-most-appearance/'}];
const europe={
'Lionel Messi':{uclMatches:163,uclGoals:129,uclAssists:40,uclMinutes:13585,uclLeft:107,uclRight:18,uclHeaders:4,uclPenalties:18,uclHattricks:8,uclTitles:4},
'Cristiano Ronaldo':{uclMatches:183,uclGoals:140,uclAssists:42,uclMinutes:15937,uclLeft:19,uclRight:96,uclHeaders:25,uclPenalties:19,uclHattricks:8,uclTitles:5},
'Sergio Ramos':{uclMatches:142},'Neymar':{uclMatches:81,uclGoals:43,uclAssists:33},'Ángel Di María':{uclMatches:116,uclGoals:24,uclAssists:41},
'Manuel Neuer':{uclMatches:161,cleanSheets:62,conceded:157},'Gianluigi Buffon':{uclMatches:124,cleanSheets:52,conceded:118},'Iker Casillas':{uclMatches:177,cleanSheets:57,conceded:202,uclTitles:3},'Alisson Becker':{cleanSheets:31},
'Kylian Mbappé':{uclGoals:70},'Luka Modrić':{uclMatches:142},'Mohamed Salah':{uclGoals:50},'Karim Benzema':{uclMatches:152,uclGoals:90,uclAssists:29},'Robert Lewandowski':{uclMatches:144,uclGoals:109}};
const rounded=(n)=>+n.toFixed(2);
for(const p of players.Football){
 const x=europe[p.name];if(!x)continue;Object.assign(p.stats,x);
 if(x.uclMatches&&x.uclGoals!=null)p.stats.uclRate=rounded(x.uclGoals/x.uclMatches);
 if(x.uclMatches&&x.uclGoals!=null&&x.uclAssists!=null){p.stats.uclGA=x.uclGoals+x.uclAssists;p.stats.uclGARate=rounded(p.stats.uclGA/x.uclMatches);}
 if(x.uclMinutes&&x.uclGoals)p.stats.uclMinGoal=rounded(x.uclMinutes/x.uclGoals);
 if(x.uclMatches&&x.cleanSheets!=null)p.stats.cleanRate=rounded(x.cleanSheets/x.uclMatches*100);
 if(x.uclMatches&&x.conceded!=null)p.stats.concededRate=rounded(x.conceded/x.uclMatches);
 p.sources.push(...uclSources);
 if(p.name==='Lionel Messi')p.sources.push({name:'UEFA Messi detailed record',url:'https://www.uefa.com/uefachampionsleague/news/02a7-212c29181390-c681db1beaba-1000--lionel-messi-in-the-champions-league-records-stats-who-he-/'});
 if(p.name==='Cristiano Ronaldo')p.sources.push({name:'UEFA Ronaldo detailed record',url:'https://www.uefa.com/uefachampionsleague/news/02a7-2136b8f054ea-76a61b3f9d24-1000--cristiano-ronaldo-in-the-champions-league-records-stats-wh/'});
}
const formats={
'MS Dhoni':{test:[90,4876,38.08,null,null,null,null,null,null,256,38],t20:[98,1617,37.60,null,null,null,null,null,null,57,34],url:'https://www.icc-cricket.com/news/mega-induction-sees-seven-new-names-added-in-icc-hall-of-fame'},
'Virat Kohli':{test:[123,9230,46.85,55.58,254,30,31,1027,30,121,0],t20:[125,4188,48.70,137.04,122,1,38,369,124,54,0],url:'https://www.icc-cricket.com/rankings/3993/virat-kohli'},
'Chris Gayle':{test:[103,7214,42.19,60.27,333,15,37,1046,98,96,0],t20:[79,1899,27.93,137.51,117,2,14,158,124,20,0],url:'https://www.icc-cricket.com/rankings/1201/chris-gayle'},
'AB de Villiers':{test:[114,8765,50.66,54.52,278,22,46,1024,64,222,5],t20:[78,1672,26.13,135.17,79,0,10,140,60,65,7],url:'https://www.icc-cricket.com/rankings/3675/ab-de-villiers'},
'Rohit Sharma':{test:[67,4301,40.58,57.06,212,12,18,473,88,68,0],t20:[159,4231,32.05,140.89,121,5,32,383,205,65,0],url:'https://www.icc-cricket.com/rankings/3852/rohit-sharma'},
'David Warner':{test:[112,8786,44.60,70.19,335,26,37,1036,69,91,0],t20:[110,3277,33.44,142.48,100,1,28,337,122,62,0],url:'https://www.icc-cricket.com/rankings/5380/david-warner'}
};
const formatKeys=['Matches','Runs','Avg','Strike','High','Hundreds','Fifties','Fours','Sixes','Catches','Stumpings'];
for(const p of players.Cricket){
 const f=formats[p.name];if(f){for(const prefix of ['test','t20'])f[prefix].forEach((v,i)=>{if(v!=null)p.stats[prefix+formatKeys[i]]=v});p.sources.push({name:'ICC Test / T20I career',url:f.url});}
 if(p.stats.matches&&p.stats.runs!=null)p.stats.runsPerMatch=rounded(p.stats.runs/p.stats.matches);
 if(p.stats.hundreds!=null&&p.stats.fifties!=null)p.stats.fiftyPlus=p.stats.hundreds+p.stats.fifties;
 if(p.stats.matches&&p.stats.wickets!=null)p.stats.wicketsPerMatch=rounded(p.stats.wickets/p.stats.matches);
 if(p.name==='Ravindra Jadeja')p.sources.push({name:'BCCI ODI career',url:'https://scores-bcci.epicon.in/domestic/men/players/ravindra-jadeja/46'});
}
const champions={'Gukesh':2024,'Mikhail Tal':1960,'Garry Kasparov':1985,'Bobby Fischer':1972,'Magnus Carlsen':2013,'Viswanathan Anand':2007,'Ding Liren':2023,'Vladimir Kramnik':2000,'Anatoly Karpov':1975};
for(const p of players.Chess){p.stats.worldChampion=champions[p.name]?1:0;p.stats.firstTitle=champions[p.name];if(Number.isFinite(p.stats.standard)&&Number.isFinite(p.stats.peak)&&p.stats.peak>=p.stats.standard)p.stats.peakGap=p.stats.peak-p.stats.standard;p.sources.push({name:'FIDE champion history',url:'https://museum.fide.com/champions'});}
const fmtRows=prefix=>formatKeys.map(k=>[prefix+k,({Matches:'Matches',Runs:'Runs',Avg:'Batting average',Strike:'Strike rate',High:'Highest score',Hundreds:'Centuries',Fifties:'Fifties',Fours:'Fours',Sixes:'Sixes',Catches:'Catches',Stumpings:'Stumpings'})[k]]);
export const groups={
Football:[
{title:'International career',note:'Senior national-team matches',rows:[['caps','Appearances'],['goals','Goals'],['rate','Goals per match']]},
{title:'Champions League',note:'UEFA competition proper; career snapshots from 2025–26, not all club matches',rows:[['uclMatches','Appearances'],['uclGoals','Goals'],['uclAssists','Assists'],['uclGA','Goal contributions'],['uclRate','Goals per match'],['uclGARate','Contributions per match'],['uclMinutes','Minutes played'],['uclMinGoal','Minutes per goal']]},
{title:'Finishing breakdown',note:'Champions League goals only',rows:[['uclLeft','Left-foot goals'],['uclRight','Right-foot goals'],['uclHeaders','Headers'],['uclPenalties','Penalties scored'],['uclHattricks','Hat-tricks']]},
{title:'Goalkeeping',note:'Champions League · full-match clean sheets',keeper:true,rows:[['cleanSheets','Clean sheets'],['cleanRate','Clean-sheet rate (%)'],['conceded','Goals conceded'],['concededRate','Goals conceded per match']]},
{title:'Honours',note:'Individual and club awards',rows:[['ballon','Ballon d’Or awards'],['uclTitles','Champions League titles']]}],
Cricket:[
{title:'ODI batting',note:'One-day international career',rows:[['matches','Matches'],['runs','Runs'],['avg','Average'],['strike','Strike rate'],['runsPerMatch','Runs per match'],['hundreds','Centuries'],['fifties','Fifties'],['fiftyPlus','Scores of 50 or more'],['high','Highest score'],['fours','Fours'],['sixes','Sixes']]},
{title:'ODI bowling & fielding',note:'Career wicket-taking and fielding',rows:[['wickets','Wickets'],['wicketsPerMatch','Wickets per match'],['economy','Economy rate'],['catches','Catches'],['stumpings','Stumpings']]},
{title:'Test cricket',note:'ICC completed career figures where available',rows:fmtRows('test')},
{title:'T20 internationals',note:'ICC completed career figures where available',rows:fmtRows('t20')}],
Chess:[
{title:'Classical rating',note:'Published historical peak and dated rating snapshot',rows:[['peak','Peak classical Elo'],['standard','Classical Elo · Nov 2026'],['peakGap','Points below peak']]},
{title:'Speed chess',note:'November 2026 snapshot; unavailable for historical players',rows:[['rapid','Rapid Elo'],['blitz','Blitz Elo']]},
{title:'World championship',note:'Undisputed or classical world championship lineage',rows:[['worldChampion','World champion'],['firstTitle','First title year']]}]};

/* User-supplied November 2026 comparison snapshot. Totals use the cited archive's
   definitions; detailed finishing figures are transcribed from the supplied table. */
const careerSnapshot={
 'Lionel Messi':{careerApps:1186,careerGoals:937,careerAssists:428,careerGA:1365,careerRate:0.79,careerPer90:0.86,careerMinGoal:104,careerNonPenalty:822,careerPenalties:115,careerFreeKicks:76,careerHattricks:62},
 'Cristiano Ronaldo':{careerApps:1345,careerGoals:987,careerAssists:261,careerGA:1248,careerRate:0.73,careerPer90:0.81,careerMinGoal:111,careerNonPenalty:802,careerPenalties:185,careerFreeKicks:65,careerHattricks:67}
};
for(const p of players.Football){if(careerSnapshot[p.name]){Object.assign(p.stats,careerSnapshot[p.name]);p.sources.push({name:'Career totals · Nov 24, 2026',url:'https://goalassistlab.com/messi-vs-ronaldo.html?lang=en'},{name:'Career comparison archive',url:'https://www.messivsronaldo.app/'});}}
groups.Football.unshift({title:'Overall career',note:'Senior club + country · November 2026 supplied snapshot. Career totals cross-checked against G+A Lab; detailed rates and finishing figures transcribed from the supplied comparison. Assist and goal conventions vary by archive.',rows:[['careerApps','Appearances'],['careerGoals','Goals'],['careerAssists','Assists'],['careerGA','Goals + assists'],['careerRate','Goals per match'],['careerPer90','Goals per 90 minutes'],['careerMinGoal','Minutes per goal'],['careerNonPenalty','Non-penalty goals'],['careerPenalties','Penalty goals'],['careerFreeKicks','Free-kick goals'],['careerHattricks','Hat-tricks']]});
