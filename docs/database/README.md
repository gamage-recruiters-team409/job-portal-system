# Database Governance

The project uses MongoDB Atlas and Mongoose. All modules use the same approved database.

Model ownership is defined in `server/src/models/README.md`. A member must not silently add, remove or rename fields in another owner's model. Changes affecting shared models require coordination, Team Lead approval and pull-request documentation.
