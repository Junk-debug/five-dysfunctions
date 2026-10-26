/**
 * Creates the Five Dysfunctions survey as a Google Form in your Drive.
 *
 * 1. Open https://script.google.com → New project, paste this file, Save.
 * 2. Pick createForm in the toolbar and click Run. Allow access when Google asks.
 * 3. Open View → Logs (or the Execution log) for the links.
 *
 * Question order matters: the dashboard groups answers by position.
 *   Absence of Trust            4, 6, 12
 *   Fear of Conflict            1, 7, 10
 *   Lack of Commitment          3, 8, 13
 *   Avoidance of Accountability 2, 11, 14
 *   Inattention to Results      5, 9, 15
 */

var TITLE = 'Five Dysfunctions of a Team: team assessment';

var DESCRIPTION =
  'Rate how often each statement is true for our team: 1 = rarely, 2 = sometimes, 3 = usually.\n' +
  'Answer for how the team works today, not how you would like it to work. It takes about 5 minutes.';

// Set to false for an anonymous survey: the dashboard then shows only totals.
var ASK_NAME = true;

var QUESTIONS = [
  /* 1  conflict       */ 'When we disagree about the work, we say so openly and argue it through.',
  /* 2  accountability */ 'People point out when a teammate\'s work or behaviour is letting the team down.',
  /* 3  commitment     */ 'Everyone knows what their teammates are working on and how it moves the team\'s goals forward.',
  /* 4  trust          */ 'People admit their mistakes quickly instead of hiding or explaining them away.',
  /* 5  results        */ 'We judge our success by what the team achieves, not by individual wins.',
  /* 6  trust          */ 'People ask each other for help without worrying how it makes them look.',
  /* 7  conflict       */ 'Our meetings take on the difficult topics instead of steering around them.',
  /* 8  commitment     */ 'Once a decision is made, everyone acts on it, including those who argued against it.',
  /* 9  results        */ 'People put the team\'s goals ahead of their own role, status or department.',
  /* 10 conflict       */ 'We can argue hard about an idea and still leave the conversation on good terms.',
  /* 11 accountability */ 'Team members hold each other to the standards we agreed on, without waiting for the manager to step in.',
  /* 12 trust          */ 'When a teammate does something we don\'t like, we assume good intentions and ask before judging.',
  /* 13 commitment     */ 'Discussions end with a clear decision and with everyone knowing who does what by when.',
  /* 14 accountability */ 'When someone misses a commitment, it is raised with them directly, not discussed behind their back.',
  /* 15 results        */ 'We notice quickly when we are off track on team goals and change course together.',
];

function createForm() {
  var form = FormApp.create(TITLE)
    .setDescription(DESCRIPTION)
    .setCollectEmail(false)
    .setProgressBar(true)
    .setConfirmationMessage('Thank you! Your answers will be discussed together with the team.');

  if (ASK_NAME) {
    // The dashboard finds this column by a short title containing "name"; keep the title as is.
    form.addTextItem()
      .setTitle('Your name')
      .setHelpText('Results are discussed openly in the team, so we can talk about why we see things differently.')
      .setRequired(false);
  }

  QUESTIONS.forEach(function (text) {
    form.addScaleItem()
      .setTitle(text)
      .setBounds(1, 3)
      .setLabels('Rarely', 'Usually')
      .setRequired(true);
  });

  // Lets anyone with the link make their own copy of this form.
  DriveApp.getFileById(form.getId()).setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  Logger.log('Edit the form:      ' + form.getEditUrl());
  Logger.log('Survey link:        ' + form.getPublishedUrl());
  Logger.log('"Make a copy" link: https://docs.google.com/forms/d/' + form.getId() + '/copy');
}
