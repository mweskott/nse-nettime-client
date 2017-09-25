import {TaskNumber} from "./task-number"
import assert = require('assert');

describe('TaskNumber', function() {
    describe('#getProject()', function() {
        it('should return project', function() {
            var project = new TaskNumber("123.45.67.89");
            assert.equal("123.45", project.getProject());
        });
    });

    describe('#getSubkect()', function() {
        it('should return the subject', function() {
            var project = new TaskNumber("123.45.67.89");
            assert.equal("123.45.67", project.getSubject());
        });
    });

    describe('#getTask()', function() {
        it('should return the task', function() {
            var project = new TaskNumber("123.45.67.89");
            assert.equal("123.45.67.89", project.getTask());
        });
    });

});
  
