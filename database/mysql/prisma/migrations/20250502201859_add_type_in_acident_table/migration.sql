-- AddForeignKey
ALTER TABLE `incidents` ADD CONSTRAINT `incidents_incident_type_fkey` FOREIGN KEY (`incident_type`) REFERENCES `incident_types`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
