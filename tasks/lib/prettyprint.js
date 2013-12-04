'use strict';

var colorState = {
    pending: 'blue',
    running: 'green',
    stopping: 'yellow',
    stopped: 'magenta',
    'shutting-down': 'yellow',
    terminated: 'red'
};

module.exports = {
    instance: function (instance) {
        console.log('%s %s (%s) [%s] on %s',
            chalk.magenta(instance.InstanceId),
            chalk.magenta(instance.ImageId),
            chalk[colorState[instance.State.Name]](instance.State.Name),
            chalk.cyan(instance.KeyName),
            chalk.underline(instance.PublicIpAddress)
        );
    }
};
