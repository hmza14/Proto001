import express from "express"
import pkg from "pg"; // This is how you import a package in ES6 modules
import cors from "cors"

const { Pool } = pkg;

const app = express()

app.use(express.json())
app.use(cors())

const pool = new Pool({
  user: 'postgres',      // Your PostgreSQL username
  host: 'localhost',     // Database host, typically localhost
  database: 'proto_DB',     // Your database name
  password: 'root',      // Your PostgreSQL password
  port: 5432,            // Default PostgreSQL port
});



app.get("/", (req,res)=>{
  res.json("Hello this is the backend !")
})


app.get("/ot", async (req, res) => {
  const q = "SELECT * FROM OTH_DAT WHERE oth_stat != '099' AND oth_stat != '030'";
  try {
      const result = await pool.query(q);
      res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
  }
});


app.post("/ot", async (req, res) => {
  const { exp_lib, exp_code, oth_lib, oth_typc, act_code, oth_stat } = req.body;
  
  if (!exp_lib || !exp_code || !oth_lib || !oth_typc) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required fields: exp_lib, exp_code, oth_lib, oth_typc" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the max oth_keyu to increment
    const maxKeyuQuery = "SELECT COALESCE(MAX(oth_keyu), 1000) as max_keyu FROM OTH_DAT";
    const keyuResult = await client.query(maxKeyuQuery);
    const nextKeyu = parseInt(keyuResult.rows[0].max_keyu) + 1;
    
    // Get the max oth_icod to increment
    const maxIcodQuery = "SELECT MAX(oth_icod) as max_icod FROM OTH_DAT";
    const icodResult = await client.query(maxIcodQuery);
    let nextIcod = 'OT001';
    
    if (icodResult.rows[0].max_icod) {
      // Extract the number part and increment
      const icodMatch = icodResult.rows[0].max_icod.match(/OT(\d+)/);
      if (icodMatch && icodMatch[1]) {
        const icodNum = parseInt(icodMatch[1], 10) + 1;
        nextIcod = `OT${icodNum.toString().padStart(3, '0')}`;
      }
    }
    
    // Get the current date and time for creation timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Format time as HHMMSS (6 characters) without colons
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds; // Format as HHMMSS
    
    // Insert the new OT
    const insertQuery = `
      INSERT INTO OTH_DAT (
        oth_keyu, oth_icod, oth_lib, exp_lib, exp_code, 
        act_code, oth_stat, oth_typc, 
        oth_crda, oth_crhe, oth_crqi
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    
    const insertValues = [
      nextKeyu,
      nextIcod,
      oth_lib,
      exp_lib,
      exp_code,
      act_code || 'ACT001',
      oth_stat || '010',
      oth_typc,
      formattedDate,
      formattedTime,
      'FRONTEND'
    ];
    
    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');
    
    res.status(201).json({
      status: "success",
      message: "OT created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating OT:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

app.get("/cmd", async (req, res) => {
  // Updated query to exclude "archived" records (otl_stat = '099')
  const q = "SELECT * FROM OTL_DAT WHERE otl_stat != '099'";
  try {
      const result = await pool.query(q);
      res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
      res.status(500).json({ status: "error", message: err.message });
  }
});

// NEW ENDPOINT: POST /cmd to create a new command
app.post("/cmd", async (req, res) => {
  // Extract data from request body
  const { otl_lib } = req.body;
  
  if (!otl_lib) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required field: otl_lib" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Get the max otl_keyu to increment
    const maxKeyuQuery = "SELECT COALESCE(MAX(otl_keyu), 2000) as max_keyu FROM OTL_DAT";
    const keyuResult = await client.query(maxKeyuQuery);
    const nextKeyu = parseInt(keyuResult.rows[0].max_keyu) + 1;
    
    // Get the max otl_code to increment
    const maxCodeQuery = "SELECT MAX(otl_code) as max_code FROM OTL_DAT";
    const codeResult = await client.query(maxCodeQuery);
    let nextCode = 'CMD001';
    
    if (codeResult.rows[0].max_code) {
      // Extract the number part and increment
      const codeMatch = codeResult.rows[0].max_code.match(/CMD(\d+)/);
      if (codeMatch && codeMatch[1]) {
        const codeNum = parseInt(codeMatch[1], 10) + 1;
        nextCode = `CMD${codeNum.toString().padStart(3, '0')}`;
      }
    }
    
    // Get the current date and time for creation timestamp
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Format time as HHMMSS (6 characters) without colons
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const minutes = String(currentDate.getMinutes()).padStart(2, '0');
    const seconds = String(currentDate.getSeconds()).padStart(2, '0');
    const formattedTime = hours + minutes + seconds; // Format as HHMMSS
    
    // Insert the new command
    const insertQuery = `
      INSERT INTO OTL_DAT (
        otl_keyu, otl_code, otl_lib, act_code, otl_stat,
        otl_crda, otl_crhe, otl_crqi
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const insertValues = [
      nextKeyu,
      nextCode,
      otl_lib,
      'ACT001',
      'NEW', // Using 'NEW' instead of '010' based on the TableSectionCMD.js code
      formattedDate,
      formattedTime,
      'FRONTEND'
    ];
    
    const result = await client.query(insertQuery, insertValues);
    await client.query('COMMIT');
    
    res.status(201).json({
      status: "success",
      message: "Command created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error creating command:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// NEW ENDPOINT: DELETE OT (Archive by setting status to '099')
app.delete("/ot/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if this OT has any assigned commands
    const checkAssignedQuery = `
      SELECT COUNT(*) as cmd_count 
      FROM OTL_DAT 
      WHERE oth_keyu = $1 AND otl_stat != '099'
    `;
    const checkResult = await client.query(checkAssignedQuery, [id]);
    
    if (parseInt(checkResult.rows[0].cmd_count) > 0) {
      // Has assigned commands, can't delete
      return res.status(400).json({
        status: "error",
        message: "Cannot delete OT with assigned commands. Please unassign all commands first."
      });
    }
    
    // Update OT status to '099' (archived)
    const updateQuery = `
      UPDATE OTH_DAT 
      SET oth_stat = '099' 
      WHERE oth_keyu = $1
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [id]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "OT not found"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "OT archived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving OT:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// NEW ENDPOINT: DELETE Multiple OTs (Archive by setting status to '099')
app.delete("/ot", async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or invalid required parameter: ids" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First check if any of these OTs have assigned commands
    const checkAssignedQuery = `
      SELECT oth_keyu, COUNT(*) as cmd_count 
      FROM OTL_DAT 
      WHERE oth_keyu = ANY($1) AND otl_stat != '099'
      GROUP BY oth_keyu
    `;
    const checkResult = await client.query(checkAssignedQuery, [ids]);
    
    const assignedOTs = checkResult.rows.filter(row => parseInt(row.cmd_count) > 0);
    
    if (assignedOTs.length > 0) {
      // Some OTs have assigned commands
      const assignedIds = assignedOTs.map(row => row.oth_keyu);
      return res.status(400).json({
        status: "error",
        message: `Cannot delete OTs with assigned commands. OTs with IDs ${assignedIds.join(', ')} have commands assigned. Please unassign all commands first.`
      });
    }
    
    // Update OT status to '099' (archived)
    const updateQuery = `
      UPDATE OTH_DAT 
      SET oth_stat = '099' 
      WHERE oth_keyu = ANY($1)
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [ids]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No OTs found with provided IDs"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${result.rowCount} OTs archived successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving OTs:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// NEW ENDPOINT: DELETE CMD (Archive by setting status to '099')
app.delete("/cmd/:id", async (req, res) => {
  const id = req.params.id;
  
  if (!id) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: id" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update CMD status to '099' (archived)
    const updateQuery = `
      UPDATE OTL_DAT 
      SET otl_stat = '099' 
      WHERE otl_keyu = $1
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [id]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "Command not found"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: "Command archived successfully",
      data: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving command:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// NEW ENDPOINT: DELETE Multiple CMDs (Archive by setting status to '099')
app.delete("/cmd", async (req, res) => {
  const { ids } = req.body;
  
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing or invalid required parameter: ids" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Update CMD status to '099' (archived)
    const updateQuery = `
      UPDATE OTL_DAT 
      SET otl_stat = '099' 
      WHERE otl_keyu = ANY($1)
      RETURNING *
    `;
    
    const result = await client.query(updateQuery, [ids]);
    
    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No commands found with provided IDs"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${result.rowCount} commands archived successfully`,
      data: result.rows
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error archiving commands:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// New endpoint to assign CMD to OT
app.put("/assign-cmd-to-ot", async (req, res) => {
  const { otId, cmdIds } = req.body;
  
  if (!otId || !cmdIds || !Array.isArray(cmdIds) || cmdIds.length === 0) {
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid request. Required: otId and cmdIds array." 
    });
  }

  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // 1. Update all CMD records to set oth_keyu to otId AND update otl_stat to "020"
    const updateCmdsQuery = `
      UPDATE OTL_DAT 
      SET oth_keyu = $1, otl_stat = '020'  
      WHERE OTL_KEYU = ANY($2)
    `;
    await client.query(updateCmdsQuery, [otId, cmdIds]);
    
    // 2. Update OT status to "020"
    const updateOtQuery = `
      UPDATE OTH_DAT 
      SET OTH_STAT = '020' 
      WHERE OTH_KEYU = $1
    `;
    await client.query(updateOtQuery, [otId]);
    
    // Commit the transaction
    await client.query('COMMIT');
    
    res.status(200).json({ 
      status: "success", 
      message: "Commands assigned to OT successfully" 
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});

// New endpoint to unassign CMD from OT
app.put("/unassign-cmd-from-ot", async (req, res) => {
  const { otId, cmdId } = req.body;
  
  if (!otId || !cmdId) {
    return res.status(400).json({ 
      status: "error", 
      message: "Invalid request. Required: otId and cmdId." 
    });
  }

  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    // 1. Update CMD record to remove oth_keyu and set status back to NEW
    const updateCmdQuery = `
      UPDATE OTL_DAT 
      SET oth_keyu = NULL, otl_stat = 'NEW'
      WHERE OTL_KEYU = $1 AND oth_keyu = $2
    `;
    await client.query(updateCmdQuery, [cmdId, otId]);
    
    // 2. Check if this OT still has any CMDs assigned
    const checkOtQuery = `
      SELECT COUNT(*) as cmd_count 
      FROM OTL_DAT 
      WHERE oth_keyu = $1
    `;
    const result = await client.query(checkOtQuery, [otId]);
    
    // 3. If no CMDs are assigned to this OT, update OT status to "010"
    if (result.rows[0].cmd_count === 0) {
      const updateOtQuery = `
        UPDATE OTH_DAT 
        SET OTH_STAT = '010' 
        WHERE OTH_KEYU = $1
      `;
      await client.query(updateOtQuery, [otId]);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    res.status(200).json({ 
      status: "success", 
      message: "Command unassigned from OT successfully" 
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query('ROLLBACK');
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


app.get("/assignments", async (req, res) => {
  try {
    // Use a simpler, more direct query that doesn't rely on joins
    // Updated to exclude archived CMDs (otl_stat = '099')
    const query = `
      SELECT otl_keyu, otl_code, otl_lib, otl_stat, oth_keyu 
      FROM OTL_DAT 
      WHERE oth_keyu IS NOT NULL AND otl_stat != '099'
    `;
    
    const result = await pool.query(query);
    console.log(`Found ${result.rows.length} assignments:`, result.rows);
    
    // Group by OT ID and ensure proper parsing of numeric values
    const assignments = {};
    
    result.rows.forEach(row => {
      // Ensure oth_keyu is treated as a number
      const otId = Number(row.oth_keyu);
      
      if (!assignments[otId]) {
        assignments[otId] = [];
      }
      
      assignments[otId].push({
        otl_keyu: row.otl_keyu,
        otl_code: row.otl_code,
        otl_lib: row.otl_lib,
        otl_stat: row.otl_stat,
        id: row.otl_keyu
      });
    });
    
    console.log("Grouped assignments:", assignments);
    
    res.status(200).json({ 
      status: "success", 
      data: assignments 
    });
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).json({ 
      status: "error", 
      message: err.message 
    });
  }
});

app.get("/equipment", async (req, res) => {
  const q = "SELECT * FROM EQP_DAT WHERE eqp_stat = '020'";
  try {
    const result = await pool.query(q);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

app.put("/validate-ot", async (req, res) => {
  const { otIds, equipmentId } = req.body;
  
  if (!otIds || !Array.isArray(otIds) || otIds.length === 0 || !equipmentId) {
    return res.status(400).json({ 
      status: "error", 
      message: "Missing required parameter: otIds or equipmentId" 
    });
  }

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // First, check if all selected OTs have assigned commands
    const checkAssignmentsQuery = `
      SELECT oth_keyu, COUNT(otl_keyu) as cmd_count
      FROM OTL_DAT
      WHERE oth_keyu = ANY($1) AND otl_stat != '099'
      GROUP BY oth_keyu
    `;
    
    const assignmentResult = await client.query(checkAssignmentsQuery, [otIds]);
    
    // Extract OT IDs that have assignments
    const otIdsWithAssignments = assignmentResult.rows.map(row => row.oth_keyu);
    
    // Check if any selected OT has no assignments
    if (otIdsWithAssignments.length < otIds.length) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        status: "error",
        message: "Certains OTs sélectionnés n'ont pas de commandes assignées. Validation impossible."
      });
    }
    
    // Update OT status to '030' (validated)
    const updateOTQuery = `
      UPDATE OTH_DAT 
      SET oth_stat = '030' 
      WHERE oth_keyu = ANY($1)
      RETURNING *
    `;
    
    const updateOTResult = await client.query(updateOTQuery, [otIds]);
    
    if (updateOTResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "No OTs found with provided IDs"
      });
    }
    
    // Update equipment status to '030'
    const updateEquipmentQuery = `
      UPDATE EQP_DAT 
      SET eqp_stat = '030' 
      WHERE eqp_keyu = $1
      RETURNING *
    `;
    
    const updateEquipmentResult = await client.query(updateEquipmentQuery, [equipmentId]);
    
    if (updateEquipmentResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        status: "error",
        message: "Equipment not found"
      });
    }
    
    await client.query('COMMIT');
    
    res.status(200).json({
      status: "success",
      message: `${updateOTResult.rowCount} OTs validated successfully`,
      data: {
        updatedOTs: updateOTResult.rows,
        updatedEquipment: updateEquipmentResult.rows[0]
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Error validating OTs:", error);
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  } finally {
    client.release();
  }
});


// Endpoint to get all KPIs in a single request
app.get("/kpis", async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Get count of validated OTs
    const validatedOTsQuery = "SELECT COUNT(*) as count_oth FROM OTH_DAT WHERE oth_stat = '030'";
    const validatedOTsResult = await client.query(validatedOTsQuery);
    
    // Get count of processed commands
    const processedCmdsQuery = "SELECT COUNT(*) as count_otl FROM OTL_DAT WHERE otl_stat IN ('020', '030')";
    const processedCmdsResult = await client.query(processedCmdsQuery);
    
    // Get count of available equipment
    const availableEquipmentQuery = "SELECT COUNT(*) as count_eqp FROM EQP_DAT WHERE eqp_stat = '020'";
    const availableEquipmentResult = await client.query(availableEquipmentQuery);
    
    // Get count of exploited equipment - NEW
    const exploitedEquipmentQuery = "SELECT COUNT(*) as count_eqp FROM EQP_DAT WHERE eqp_stat = '030'";
    const exploitedEquipmentResult = await client.query(exploitedEquipmentQuery);
    
    // Prepare response with all KPIs
    const kpis = {
      validatedOTs: parseInt(validatedOTsResult.rows[0].count_oth) || 0,
      processedCommands: parseInt(processedCmdsResult.rows[0].count_otl) || 0,
      availableEquipment: parseInt(availableEquipmentResult.rows[0].count_eqp) || 0,
      exploitedEquipment: parseInt(exploitedEquipmentResult.rows[0].count_eqp) || 0 // NEW
    };
    
    res.status(200).json({
      status: "success",
      data: kpis
    });
  } catch (error) {
    console.error("Error fetching KPIs:", error);
    res.status(500).json({
      status: "error",
      message: error.message
    });
  } finally {
    client.release();
  }
});


app.listen(8800, ()=>{
  console.log("Connected to backend!")
})