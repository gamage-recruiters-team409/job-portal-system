export default function SkillsMultiSelect({
  options,
  selectedIds,
  onChange,
  selectClass,
  selectArrowStyle,
}) {
  const selectedSkills = options.filter((s) => selectedIds.includes(s._id));
  const availableOptions = options.filter((s) => !selectedIds.includes(s._id));

  const addSkill = (id) => {
    if (id) onChange([...selectedIds, id]);
  };

  const removeSkill = (id) => {
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  return (
    <div>
      <select
        className={selectClass}
        style={selectArrowStyle}
        value=""
        onChange={(e) => addSkill(e.target.value)}
      >
        <option value="">Select skills</option>
        {availableOptions.map((s) => (
          <option key={s._id} value={s._id}>
            {s.skillName}
          </option>
        ))}
      </select>
      {selectedSkills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedSkills.map((s) => (
            <span
              key={s._id}
              className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]"
            >
              {s.skillName}
              <button
                type="button"
                onClick={() => removeSkill(s._id)}
                className="ml-1 text-[#2563EB] hover:text-[#1D4ED8]"
                aria-label={`Remove ${s.skillName}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
