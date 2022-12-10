import assert = require('assert');
import {TaskNumber} from './task-number';

describe('TaskNumber', function() {
    describe('#getProject()', function() {
        it('should return project', function() {
            const project = new TaskNumber('123.45.67.89');
            assert.equal('123.45', project.getProject());
        });
    });

    describe('#getSubkect()', function() {
        it('should return the subject', function() {
            const project = new TaskNumber('123.45.67.89');
            assert.equal('123.45.67', project.getSubject());
        });
    });

    describe('#getTask()', function() {
        it('should return the task', function() {
            const project = new TaskNumber('123.45.67.89');
            assert.equal('123.45.67.89', project.getTask());
        });
    });
});
