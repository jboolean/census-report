/**
 * The module containing the Class
 * @module bmp-selfreport-text-generators
 */
YUI.add('bmp-selfreport-text-generators', function(Y) {

  var subAndEscape = function() {
    return Y.Escape.html(Y.Lang.sub.apply(this, arguments));
  };

  Y.namespace('BMP').SelfReportTextGenerators = {
    getListNode: function(report) {
      if (!this[report.version]) {
        console.error('unsupported report version');
        return null;
      }

      var out = this[report.version](report);
      var li = Y.Node.create('<li>');
      li.setHTML(out);
      li.setAttribute('data-id', report.id);
      return li;
    },

    1: function(report) {
      var out = '';

      if (Y.Lang.isString(report.name)) {
        out += subAndEscape('My name is {name}, and ', report);
      }

      out += 'I made ' + Y.Escape.html(report.project_description);
      
      if (Y.Lang.isValue(report.space_price_amount) || Y.Lang.isValue(report.space_type)) {
        out += subAndEscape(' while renting a {space_type}', {
          space_type: report.space_type || 'space'
        });
      }

      if (Y.Lang.isValue(report.space_zip)) {
        out += subAndEscape(' in {space_zip}', report);
      }

      if (Y.Lang.isValue(report.space_price_amount)) {
        out += ' for';
        if (report.space_price_amount === '$0.00') {
          out += ' free';
        } else {
          out += ' ' + Y.Escape.html(report.space_price_amount);

          if (Y.Lang.isValue(report.space_price_unit)) {
            out += ' per ' + Y.Escape.html(report.space_price_unit);
          }
        }
      } //end space price

      if (Y.Lang.isValue(report.project_year)) {
        out += subAndEscape(' in {project_year}', report);
      }

      out += '.';

      if (Y.Lang.isValue(report.project_url)) {
        out += ' Find out more about it at ' +
          Y.Lang.sub('<a href="{project_url}" target="_blank" ' +
            'class="external">{project_url_domain} ' +
            '</a>.', {
            project_url: report.project_url.replace('"', '&quot;'),
            project_url_domain: Y.Escape.html(report.project_url_domain)
          });
      }

      return out;
    },

    2: function(report) {
      sentence1 = '';
      if (Y.Lang.isString(report.name)) {
        sentence1 += subAndEscape('My name is {name}, and ', report);
      }
      sentence1 += 'I';

      if (Y.Lang.isString(report.fod)) {
        sentence1 += subAndEscape(' studied {fod} as an undergraduate and', report);
      }

      var hasApartment = Y.Lang.isValue(report.space_price_amount);
      var hasLoan = Y.Lang.isValue(report.loan_price_amount);

      if (hasApartment || hasLoan) {
        sentence1 += ' currently pay';
      }

      if (hasApartment) {
        sentence1 += subAndEscape(' {space_price_amount} to rent an apartment', report);
        if (Y.Lang.isValue(report.space_zip)) {
          sentence1 += subAndEscape(' in {space_zip}', report);
        }
        sentence1 += ' and';
      }

      if (hasLoan) {
        sentence1 += subAndEscape(' {loan_price_amount} per month in student loans', report);
      }

      // could have ended sentence clause with 'and'. Fix it.
      sentence1 = sentence1.replace(/ and$/, '');

      var hasOccupation = Y.Lang.isString(report.occupation);
      var hasSalary = Y.Lang.isValue(report.salary_amount);
      var hadPreviousClauses = !sentence1.match(/I$/);

      if ((hasOccupation || hasSalary) && hadPreviousClauses) {
        sentence1 += ' while';
      }

      if (hasOccupation) {
        sentence1 += hadPreviousClauses ? ' working' : ' work';
        sentence1 += subAndEscape(' primarily in {occupation}', report);
        if (hasSalary) {
          sentence1 += ' and';
        }
      }

      if (hasSalary) {
        sentence1 += hadPreviousClauses ? ' making' : ' make';
        sentence1 += subAndEscape(' roughly {salary_amount} per {salary_amount_time_unit}', report);
        if (Y.Lang.isValue(report.family_members)) {
          sentence1 += subAndEscape(' for a family of {family_members}', report);
        }
      }

      // sanity check. Add the period of this sentence is substation, or chuck it.
      if (sentence1.length > 5) {
        sentence1 += '.';
      } else {
        sentence1 = '';
      }

      var sentence2 = '';

      if (report.age || report.ethnicity || report.gender) {
        sentence2 += ' I am';
      }

      if (report.age || report.gender) {
        sentence2 += ' a';
        //So that we DON'T say 'I am a chinese.' but 
        // DO SAY 'I am a chinese male'.
      }

      if (report.age) {
        report.age = (Number)(report.age);
        // aN 18 80, 8 year old
        if (report.age === 18 || ('' + report.age).match(/^8/)) {
          sentence2 += 'n';// a => an
        }

        if (report.age) {
          sentence2 += subAndEscape(' {age} year old', report);
        }
      }

      if (report.ethnicity) {
        sentence2 += subAndEscape(' {ethnicity}', report);
      }

      if (report.gender) {
        sentence2 += subAndEscape(' {gender}', report);
      }

      if (sentence2.length > 5) {
        sentence2 += '.';
      }

      var sentence3 = '';

      if (report.comment) {
        sentence3 += subAndEscape('I think this survey is {comment}.', report);
      }

      return [sentence1, sentence2, sentence3].join(' ');
    }
  };
  
}, '1.0', {
  requires:[
    'escape'
  ]
});