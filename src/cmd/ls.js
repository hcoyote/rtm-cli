'use strict';

const df = require('dateformat');
const login = require('../utils/login.js');
const sort = require('../utils/sort.js');
const log = require('../utils/log.js');
const config = require('../utils/config.js').get();
const styles = config.styles;


/**
 * This command will display all of the User's tasks sorted first by list,
 * then completed status, then priority, then due date
 */
function action() {

  // Get the authenticated User
  login(function(user) {

    // Start Spinner
    log.spinner.start("Fetching Tasks...");

    // Get User Tasks
    user.tasks.get(function(err, tasks) {
      if ( err ) {
        return log.spinner.error(err.toString());
      }
      log.spinner.stop();

      // Sort Tasks
      tasks.sort(sort.tasks.ls);

      // Last List Name
      let listname = "";

      // Parse each task
      for ( let i = 0; i < tasks.length; i++ ) {
        let task = tasks[i];


        // ==== PRINT LIST NAME ==== //

        // Print New List Name
        if ( task._list.name !== listname ) {
          if ( listname !== "" ) {
            log();
          }
          listname = task._list.name;
          for ( let i = 0; i < tasks.length.toString().length+1; i++ ) {
            log(' ', false);
          }
          log.style(listname, styles.list, true);
        }



        // ==== PRINT TASK INFORMATION ==== //

        // Print Task Index
        log.style(_pad(task.index, tasks.length) + ' ', styles.index);

        // Add the Task Priority
        let namestyle = '';
        let nametext = '';
        if ( !task.completed ) {
          namestyle = styles.priority[task.priority.toString()];
          if ( task.priority === 0 ) {
            nametext += '    ';
          }
          else {
            nametext += '(' + task.priority + ') ';
          }
        }
        else {
          namestyle = styles.completed;
          nametext = ' x  ';
        }

        // Add the Task Name
        nametext += task.name;

        // Print the Priority and Name
        log.style(nametext, namestyle);

        // Print Note Indicators
        let notestyle = task.isCompleted ? styles.completed : styles.notes;
        for ( let i = 0; i < task.notes.length; i++ ) {
          log.style('*', notestyle);
        }

        // Print Tags
        let tagstyle = task.isCompleted ? styles.completed : styles.tags;
        for ( let i = 0; i < task.tags.length; i++ ) {
          log.style(' #' + task.tags[i], tagstyle);
        }

        // Print Due Date / Completed Date
        if ( !task.isCompleted ) {
          if ( task.due ) {
            log.style(' | ' + df(task.due, config.dateformat), styles.due);
          }
        }
        else {
          if ( task.completed ) {
            log.style(' x ' + df(task.completed, config.dateformat), styles.completed);
          }
        }

        // Finish line
        log('');

      }

      // QUIT
      process.exit(0);

    });

  });

}


/**
 * Pad the Index number with leading 0s
 * @param index Task Index Number
 * @param count Number of Tasks
 * @returns {string}
 * @private
 */
function _pad(index, count) {
  let max = (count-1).toString().length;
  let digits = index.toString().length;
  let delta = max - digits;
  for ( let i = 0; i < delta; i++ ) {
    index = '0' + index;
  }
  return index;
}



module.exports = {
  command: 'ls [filter]',
  description: 'List all tasks sorted first by list then by priority',
  action: action
};