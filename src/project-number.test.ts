import {ProjectNumber} from "./project-number"
import assert = require('assert');

describe('ProjectNumber', function() {
    describe('#getProject()', function() {
        it('should return project', function() {
            var project = new ProjectNumber("123.45.67.89");
            assert.equal("123.45", project.getProject());
        });
    });

    describe('#getWorkItem()', function() {
        it('should return work item', function() {
            var project = new ProjectNumber("123.45.67.89");
            assert.equal("123.45.67", project.getWorkItem());
        });
    });

});
  
